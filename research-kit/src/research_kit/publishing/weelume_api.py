"""把 research-kit 产物上传到 Weelume 后端的实现。

设计目标：
- 输入只依赖工作区目录与（可选）报告 run_id，约定大于配置。
- 解析 profile.json 与 overview.html 为标准 payload，再通过 HTTP 上传，避免
  让 research-kit 直接依赖后端 ORM 或数据库连接。
- 错误显式抛出，CLI 层负责打印；不静默吞掉失败。

图片处理流程（base64 内嵌已废弃）：
- skill 生成的 overview.html 里所有图片都是 ``data-rk-frame="<rel>"`` 占位符；
- publish 时扫描占位符，把每张本地图片上传到腾讯云 COS，再把占位符替换为
  ``src="https://<bucket>.cos.<region>.myqcloud.com/<key>"``；
- object key 命名：``blogger-insights/{slug}/{run_id}/{rel_with_slash_to_underscore}``，
  例：``avatar.jpg`` → ``blogger-insights/jane/20260520T133355Z/avatar.jpg``；
        ``7637.../1.jpg`` → ``blogger-insights/jane/20260520T133355Z/7637..._1.jpg``；
- avatar 不再走 base64 data URI，而是 payload.avatar_url 直接取上面同一份 COS URL。
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol

import httpx

_LOGGER = logging.getLogger(__name__)

DEFAULT_PLATFORM = "douyin"
DEFAULT_TIMEOUT_SECONDS = 60.0
# HTML 占位符已经走 COS 外链，正文 ≈ 100KB 量级；保留 8MB 上限作为防错兜底。
MAX_REPORT_HTML_BYTES = 8 * 1024 * 1024

# 默认 COS object key 前缀，与 server 端 blogger_insights 业务空间隔离。
DEFAULT_COS_KEY_PREFIX = "blogger-insights"

_FRAME_PLACEHOLDER_PATTERN = re.compile(r'data-rk-frame="([^"]+)"')


class FrameUploader(Protocol):
    """frame 上传协议：传入本地路径与 object key，返回公开 HTTPS URL。

    抽成协议是为了测试时可以注入 in-memory mock，避免单测必须连真 COS。
    """

    def upload_file(self, *, local_path: Path, object_key: str) -> str: ...


class PublishError(RuntimeError):
    """publish 流程显式错误。"""


@dataclass(frozen=True)
class BloggerInsightPayload:
    """与后端 BloggerInsightImportRequest 对齐的 payload。"""

    slug: str
    platform: str
    display_name: str
    avatar_url: str | None
    signature: str | None
    fans_count: int | None
    total_works_count: int | None
    industry: str | None
    positioning: str | None
    tags: tuple[str, ...]
    cover_image_url: str | None
    report_html: str
    report_summary: dict[str, Any] | None
    source_run_id: str | None
    captured_at: datetime | None
    is_free: bool = False
    status: str = "published"

    def to_request_body(self) -> dict[str, Any]:
        body: dict[str, Any] = {
            "slug": self.slug,
            "platform": self.platform,
            "display_name": self.display_name,
            "tags": list(self.tags),
            "report_html": self.report_html,
            "is_free": self.is_free,
            "status": self.status,
        }
        if self.avatar_url is not None:
            body["avatar_url"] = self.avatar_url
        if self.signature is not None:
            body["signature"] = self.signature
        if self.fans_count is not None:
            body["fans_count"] = self.fans_count
        if self.total_works_count is not None:
            body["total_works_count"] = self.total_works_count
        if self.industry is not None:
            body["industry"] = self.industry
        if self.positioning is not None:
            body["positioning"] = self.positioning
        if self.cover_image_url is not None:
            body["cover_image_url"] = self.cover_image_url
        if self.report_summary is not None:
            body["report_summary"] = self.report_summary
        if self.source_run_id is not None:
            body["source_run_id"] = self.source_run_id
        if self.captured_at is not None:
            body["captured_at"] = self.captured_at.isoformat()
        return body


@dataclass(frozen=True)
class PublishResult:
    """后端返回结果（仅保留核心字段）。"""

    slug: str
    display_name: str
    published_at: str | None
    response: dict[str, Any] = field(default_factory=dict)


def _resolve_raw_dir(workspace: Path) -> Path:
    """workspace 既可能直接指向 `<blogger>/raw`，也可能指向 `<blogger>`。"""

    if (workspace / "profile.json").exists():
        return workspace
    if (workspace / "raw" / "profile.json").exists():
        return workspace / "raw"
    raise PublishError(
        f"workspace 中找不到 profile.json：{workspace}（已尝试 raw/ 子目录）"
    )


def _resolve_reports_dir(workspace: Path, raw_dir: Path) -> Path:
    """reports 目录默认与 raw 目录同级（约定：<blogger>/raw + <blogger>/reports）。"""

    if (workspace / "reports").is_dir():
        return workspace / "reports"
    blogger_root = raw_dir.parent
    if (blogger_root / "reports").is_dir():
        return blogger_root / "reports"
    raise PublishError(
        f"找不到 reports 目录（应位于 workspace 或 raw 的同级）：{workspace}"
    )


def _pick_latest_run(reports_dir: Path) -> Path:
    candidates = [child for child in reports_dir.iterdir() if child.is_dir()]
    if not candidates:
        raise PublishError(f"reports 目录中没有任何 run：{reports_dir}")
    candidates.sort(key=lambda path: path.name, reverse=True)
    return candidates[0]


def _read_profile(raw_dir: Path) -> dict[str, Any]:
    profile_path = raw_dir / "profile.json"
    raw = profile_path.read_text(encoding="utf-8")
    payload = json.loads(raw)
    if not isinstance(payload, dict):
        raise PublishError(f"profile.json 顶层必须是对象：{profile_path}")
    return payload


def _read_index(report_dir: Path) -> dict[str, Any] | None:
    index_path = report_dir / "index.json"
    if not index_path.is_file():
        return None
    try:
        payload = json.loads(index_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise PublishError(f"reports/index.json 无法解析：{index_path}") from exc
    if not isinstance(payload, dict):
        raise PublishError(f"reports/index.json 顶层必须是对象：{index_path}")
    return payload


def _read_report_html(report_dir: Path) -> str:
    overview = report_dir / "overview.html"
    if not overview.is_file():
        raise PublishError(f"缺少 overview.html：{overview}")
    raw_bytes = overview.read_bytes()
    if len(raw_bytes) > MAX_REPORT_HTML_BYTES:
        raise PublishError(
            f"overview.html 体积超过 {MAX_REPORT_HTML_BYTES} 字节（{len(raw_bytes)}），"
            "请确认是否包含了大量内嵌 base64 资源。"
        )
    return raw_bytes.decode("utf-8")


def _object_key_for_frame(*, prefix: str, slug: str, run_id: str, rel: str) -> str:
    """把 ``<aweme_id>/1.jpg`` 这种 workspace 相对路径转成扁平 object key。

    斜杠换成下划线是为了让 COS 控制台同一个 run 下的图片排在一起，避免每个
    aweme_id 都生成一个子目录、控制台翻起来累；同时也方便在 URL 里直接看出
    "这是这次 run 的哪张图"。
    """

    safe_rel = rel.strip().lstrip("/").replace("\\", "/").replace("/", "_")
    if safe_rel == "":
        raise PublishError("frame 占位符相对路径为空")
    return f"{prefix.rstrip('/')}/{slug}/{run_id}/{safe_rel}"


def _resolve_local_frame(*, raw_dir: Path, rel: str) -> Path | None:
    """把 ``data-rk-frame="<rel>"`` 解析到本地文件路径，含 workspace 越界保护。"""

    rel_normalized = rel.strip().lstrip("/")
    if rel_normalized == "":
        return None
    candidate = (raw_dir / rel_normalized).resolve()
    raw_dir_resolved = raw_dir.resolve()
    try:
        candidate.relative_to(raw_dir_resolved)
    except ValueError:
        _LOGGER.warning(
            "data-rk-frame 占位符越出 workspace，已忽略：rel=%s", rel_normalized
        )
        return None
    if not candidate.is_file():
        _LOGGER.warning("本地图片缺失，跳过上传：%s", candidate)
        return None
    if candidate.stat().st_size < 256:
        _LOGGER.warning(
            "图片字节过小（%d），疑似下载残留，跳过上传：%s",
            candidate.stat().st_size,
            candidate,
        )
        return None
    return candidate


@dataclass(frozen=True)
class HtmlRewriteResult:
    """rewrite 完一份 HTML 后的结果，便于 caller 和测试看清发生了什么。"""

    html: str
    uploaded: dict[str, str]  # rel -> cos_url
    missing: tuple[str, ...]  # 占位符本地文件缺失的 rel 列表


def rewrite_html_frames_to_cos(
    *,
    html: str,
    raw_dir: Path,
    uploader: FrameUploader,
    slug: str,
    run_id: str,
    key_prefix: str = DEFAULT_COS_KEY_PREFIX,
) -> HtmlRewriteResult:
    """扫描 HTML 中所有 ``data-rk-frame="<rel>"``，上传 COS 并改写为 ``src="<url>"``。

    · 同一 rel 在 HTML 里多次出现只会上传一次（用 dict 缓存）；
    · 本地文件缺失时保留原占位符，由 caller 决定是否要硬失败；
    · 上传抛出的异常一路传出，不静默吞——publish 阶段失败比"半成品报告"安全。
    """

    cache: dict[str, str] = {}
    missing: list[str] = []

    def _replace(match: re.Match[str]) -> str:
        rel = match.group(1)
        if rel in cache:
            return f'src="{cache[rel]}"'
        local = _resolve_local_frame(raw_dir=raw_dir, rel=rel)
        if local is None:
            missing.append(rel)
            return match.group(0)
        object_key = _object_key_for_frame(
            prefix=key_prefix, slug=slug, run_id=run_id, rel=rel
        )
        url = uploader.upload_file(local_path=local, object_key=object_key)
        cache[rel] = url
        return f'src="{url}"'

    rewritten = _FRAME_PLACEHOLDER_PATTERN.sub(_replace, html)
    return HtmlRewriteResult(
        html=rewritten,
        uploaded=dict(cache),
        missing=tuple(missing),
    )


def _avatar_cos_url(
    *, profile: dict[str, Any], uploaded: dict[str, str]
) -> str | None:
    """从 rewrite 结果中找出 avatar 的 COS URL。

    profile.json 里 ``avatar_path`` 通常就是 ``avatar.jpg``，本地文件被 HTML
    通过 ``data-rk-frame="avatar.jpg"`` 占位引用，rewrite_html_frames_to_cos
    一次就能把头像和 frame 一起上传完，这里直接复用 URL，不再重复 IO。
    """

    avatar_path = profile.get("avatar_path")
    if not isinstance(avatar_path, str):
        return None
    key = avatar_path.strip().lstrip("/")
    if key == "":
        return None
    return uploaded.get(key)


def _parse_captured_at(value: Any) -> datetime | None:
    if value is None:
        return None
    if not isinstance(value, str):
        return None
    text = value.strip()
    if text == "":
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).replace(tzinfo=None)


def load_publish_payload(
    *,
    workspace: Path,
    platform: str = DEFAULT_PLATFORM,
    run_id: str | None = None,
    slug_override: str | None = None,
    industry: str | None = None,
    positioning: str | None = None,
    tags: tuple[str, ...] = (),
    cover_image_url: str | None = None,
    is_free: bool = False,
    status: str = "published",
    uploader: FrameUploader | None = None,
    cos_key_prefix: str = DEFAULT_COS_KEY_PREFIX,
    skip_cos_upload: bool = False,
) -> BloggerInsightPayload:
    """从工作区解析出 publish payload。

    若 ``uploader`` 为 None，则按需懒加载 ``CosFrameUploader``——只在 HTML 里
    确实出现 ``data-rk-frame`` 占位符时才会去摸 COS 凭证，纯文本报告（理论上
    不存在但要兼容）不会被强制要求 COS 凭证存在。

    ``skip_cos_upload=True`` 用于本地 dry-run：完全跳过 COS 上传，HTML 中的
    占位符保留原样、``avatar_url`` 为 None。**这种 payload 不能真的 POST 到
    后端**——CLI 层应该强制配 ``--dry-run`` 使用。
    """

    raw_dir = _resolve_raw_dir(workspace)
    reports_dir = _resolve_reports_dir(workspace, raw_dir)
    report_dir = (reports_dir / run_id) if run_id else _pick_latest_run(reports_dir)
    if not report_dir.is_dir():
        raise PublishError(f"指定的 run 目录不存在：{report_dir}")

    profile = _read_profile(raw_dir)
    index = _read_index(report_dir)

    blogger_id = profile.get("blogger_id") or profile.get("sec_uid")
    if not isinstance(blogger_id, str) or blogger_id.strip() == "":
        raise PublishError("profile.json 中缺少 blogger_id / sec_uid")

    display_name = profile.get("display_name")
    if not isinstance(display_name, str) or display_name.strip() == "":
        raise PublishError("profile.json 中缺少 display_name")

    slug = slug_override.strip() if slug_override else blogger_id.strip()
    signature = profile.get("description") if isinstance(profile.get("description"), str) else None
    fans_count = profile.get("follower_count") if isinstance(profile.get("follower_count"), int) else None
    total_works = profile.get("total_works_count") if isinstance(profile.get("total_works_count"), int) else None
    captured_at = _parse_captured_at(profile.get("captured_at"))
    report_html = _read_report_html(report_dir)
    summary_payload: dict[str, Any] | None = None
    source_run_id = report_dir.name
    if index is not None:
        summary_payload = index
        run_id_from_index = index.get("run_id")
        if isinstance(run_id_from_index, str) and run_id_from_index.strip():
            source_run_id = run_id_from_index.strip()

    avatar_url: str | None = None
    has_placeholders = _FRAME_PLACEHOLDER_PATTERN.search(report_html) is not None
    if has_placeholders and not skip_cos_upload:
        effective_uploader = uploader or _default_uploader()
        rewrite = rewrite_html_frames_to_cos(
            html=report_html,
            raw_dir=raw_dir,
            uploader=effective_uploader,
            slug=slug,
            run_id=source_run_id,
            key_prefix=cos_key_prefix,
        )
        report_html = rewrite.html
        if rewrite.missing:
            _LOGGER.warning(
                "%d 个 data-rk-frame 占位符对应文件缺失，HTML 中保留原占位：%s",
                len(rewrite.missing),
                ", ".join(rewrite.missing),
            )
        avatar_url = _avatar_cos_url(profile=profile, uploaded=rewrite.uploaded)
    elif has_placeholders and skip_cos_upload:
        _LOGGER.warning(
            "skip_cos_upload=True：HTML 中 %d 个 data-rk-frame 占位符未替换，"
            "payload 不应被真实 POST 到后端。",
            len(_FRAME_PLACEHOLDER_PATTERN.findall(report_html)),
        )

    return BloggerInsightPayload(
        slug=slug,
        platform=platform,
        display_name=display_name.strip(),
        avatar_url=avatar_url,
        signature=signature,
        fans_count=fans_count,
        total_works_count=total_works,
        industry=industry,
        positioning=positioning,
        tags=tags,
        cover_image_url=cover_image_url,
        report_html=report_html,
        report_summary=summary_payload,
        source_run_id=source_run_id,
        captured_at=captured_at,
        is_free=is_free,
        status=status,
    )


def _default_uploader() -> FrameUploader:
    """懒加载默认 CosFrameUploader，失败时抛 PublishError 而非 CosUploadError，
    让 CLI 的统一错误捕获能拿到。"""

    from .cos_storage import CosFrameUploader, CosUploadError

    try:
        return CosFrameUploader()
    except CosUploadError as exc:
        raise PublishError(str(exc)) from exc


def publish_blogger_insight(
    *,
    payload: BloggerInsightPayload,
    api_base: str,
    token: str,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
) -> PublishResult:
    """通过 HTTP 上传 payload 到后端。"""

    api_base = api_base.rstrip("/")
    if api_base == "":
        raise PublishError("api_base 不能为空")
    if token.strip() == "":
        raise PublishError("token 不能为空")

    url = f"{api_base}/api/v1/blogger-insights/import"
    body = payload.to_request_body()
    headers = {
        "X-Import-Token": token.strip(),
        "Content-Type": "application/json",
    }

    _LOGGER.info(
        "publish blogger insight slug=%s platform=%s display_name=%s url=%s",
        payload.slug,
        payload.platform,
        payload.display_name,
        url,
    )

    try:
        response = httpx.post(url, headers=headers, json=body, timeout=timeout_seconds)
    except httpx.HTTPError as exc:
        raise PublishError(f"HTTP 请求失败：{exc}") from exc

    if response.status_code >= 400:
        raise PublishError(
            f"后端返回 {response.status_code}: {response.text[:512]}"
        )

    try:
        envelope = response.json()
    except json.JSONDecodeError as exc:
        raise PublishError(f"后端返回非 JSON：{response.text[:512]}") from exc

    data = envelope.get("data") if isinstance(envelope, dict) else None
    if not isinstance(data, dict):
        raise PublishError(f"后端响应缺少 data 字段：{envelope}")

    return PublishResult(
        slug=str(data.get("slug", payload.slug)),
        display_name=str(data.get("display_name", payload.display_name)),
        published_at=(
            str(data["published_at"])
            if isinstance(data.get("published_at"), str)
            else None
        ),
        response=envelope,
    )
