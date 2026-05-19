"""把 research-kit 产物上传到 Weelume 后端的实现。

设计目标：
- 输入只依赖工作区目录与（可选）报告 run_id，约定大于配置。
- 解析 profile.json 与 overview.html 为标准 payload，再通过 HTTP 上传，避免
  让 research-kit 直接依赖后端 ORM 或数据库连接。
- 错误显式抛出，CLI 层负责打印；不静默吞掉失败。
"""

from __future__ import annotations

import base64
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

_LOGGER = logging.getLogger(__name__)

DEFAULT_PLATFORM = "douyin"
DEFAULT_TIMEOUT_SECONDS = 60.0
MAX_REPORT_HTML_BYTES = 8 * 1024 * 1024  # 单份报告上限 8MB，避免误传超大产物


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
    status: str = "published"

    def to_request_body(self) -> dict[str, Any]:
        body: dict[str, Any] = {
            "slug": self.slug,
            "platform": self.platform,
            "display_name": self.display_name,
            "tags": list(self.tags),
            "report_html": self.report_html,
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


def _detect_image_mime(data: bytes) -> str:
    """从 magic bytes 推断头像 MIME。collector 落盘统一叫 avatar.jpg，但实际可能是
    抖音 CDN 返回的 webp / png / jpeg。猜错会让浏览器拒渲染，所以读字节而不是看后缀。"""

    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp"
    if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        return "image/gif"
    return "image/jpeg"


def _encode_avatar_data_uri(raw_dir: Path, avatar_path_value: Any) -> str | None:
    """把 collector 下载的 avatar.jpg 转成 data:image/...;base64,... URI。

    设计取舍：
      · 抖音 CDN 头像 URL 形如 p3-pc.douyinpic.com/...?from=xxx，URL 携带
        来源标记，未来可能升级成短期签名，外链稳定性不可靠。
      · 官网博主卡片需要稳定渲染头像，所以上传阶段直接把本地文件 base64 化。
      · `avatar_url` 字段后端已扩成 TEXT 类型（migration 0020），不再 2048 截断。
      · 如果本地文件缺失（collector 下载失败 / 文件被清理），返回 None，
        让卡片 fallback 到首字母占位——禁止再外链抖音 CDN。
    """

    if not isinstance(avatar_path_value, str) or avatar_path_value.strip() == "":
        return None
    rel = avatar_path_value.strip()
    candidate = (raw_dir / rel).resolve()
    raw_dir_resolved = raw_dir.resolve()
    try:
        candidate.relative_to(raw_dir_resolved)
    except ValueError:
        _LOGGER.warning(
            "profile.json avatar_path 越出 workspace，已忽略：rel=%s", rel
        )
        return None
    if not candidate.is_file():
        _LOGGER.warning("本地头像缺失，avatar_url 将设为 null：%s", candidate)
        return None
    data = candidate.read_bytes()
    if len(data) < 256:
        _LOGGER.warning(
            "本地头像字节过小（%d），疑似下载残留，avatar_url 设为 null：%s",
            len(data),
            candidate,
        )
        return None
    mime = _detect_image_mime(data)
    encoded = base64.b64encode(data).decode("ascii")
    return f"data:{mime};base64,{encoded}"


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
    status: str = "published",
) -> BloggerInsightPayload:
    """从工作区解析出 publish payload。"""

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
    # 不再直接透传抖音 CDN URL（会断图）：优先把本地 avatar.jpg 转 base64 data URI，
    # 本地文件缺失则 avatar_url=None，让官网卡片走首字母占位。
    avatar_url = _encode_avatar_data_uri(raw_dir, profile.get("avatar_path"))
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
        status=status,
    )


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
