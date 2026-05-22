"""把 research-kit 产出的赛道分析报告上传到 Weelume 后端。

设计目标：
- 解析 ``output/tracks/<slug>/`` 工作区下的 ``reports/<run_id>/index.json`` 与对应
  HTML，组装 payload，再通过 POST /api/v1/track-analyses/import 上传。
- 不依赖后端 ORM；HTTP-only。
- 失败显式抛出（``PublishError``），CLI 层统一打印。

为什么不复用 ``weelume_api.py``：
- 报告结构不同：博主一个 overview.html，赛道有 6 份独立 HTML + index.json 索引。
- COS 重写不需要：赛道 HTML 自包含（Tailwind CDN + 内联图表），没有
  ``data-rk-frame`` 占位符。
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from .environments import (
    DEFAULT_API_BASE_ENV_VAR,
    PUBLISH_ENV_VAR,
    PublishEnvironment,
    ResolvedTarget,
    find_envs_file,
    load_envs_config,
)
from .weelume_api import PublishError

_LOGGER = logging.getLogger(__name__)

DEFAULT_TIMEOUT_SECONDS = 60.0
# 单份赛道 HTML 报告体积上限：通常 30-80KB，留 2MB 兜底。
MAX_SINGLE_REPORT_HTML_BYTES = 2 * 1024 * 1024

DEFAULT_TRACK_TOKEN_ENV_VAR = "WEELUME_TRACK_ANALYSIS_IMPORT_TOKEN"

# 报告 type → key 映射：track-research skill 在 index.json 里使用 type 字段
# 描述报告类别（overview / market / competition / business_model / ai_analysis /
# playbook），与后端 reports JSONB 中存的 key 是同一个语义。直接使用 type 作为 key
# 以保持一一对应。
_KNOWN_REPORT_TYPES = {
    "overview",
    "market",
    "competition",
    "business_model",
    "ai_analysis",
    "playbook",
}


@dataclass(frozen=True)
class TrackReportPayload:
    """单份赛道报告 payload。"""

    key: str
    title: str
    type: str
    sections: int
    charts: int
    description: str
    html: str

    def to_request_body(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "title": self.title,
            "type": self.type,
            "sections": self.sections,
            "charts": self.charts,
            "description": self.description,
            "html": self.html,
        }


@dataclass(frozen=True)
class TrackAnalysisPayload:
    """与后端 TrackAnalysisImportRequest 对齐的 payload。"""

    slug: str
    track_keyword: str
    region: str
    audience: str
    industry: str | None
    stance: str | None
    stance_summary: str | None
    cover_image_url: str | None
    tags: tuple[str, ...]
    key_numbers: dict[str, float] | None
    data_sources_count: int | None
    reports: tuple[TrackReportPayload, ...]
    source_run_id: str | None
    captured_at: datetime | None
    is_free: bool = False
    status: str = "published"

    def to_request_body(self) -> dict[str, Any]:
        body: dict[str, Any] = {
            "slug": self.slug,
            "track_keyword": self.track_keyword,
            "region": self.region,
            "audience": self.audience,
            "tags": list(self.tags),
            "reports": [report.to_request_body() for report in self.reports],
            "is_free": self.is_free,
            "status": self.status,
        }
        if self.industry is not None:
            body["industry"] = self.industry
        if self.stance is not None:
            body["stance"] = self.stance
        if self.stance_summary is not None:
            body["stance_summary"] = self.stance_summary
        if self.cover_image_url is not None:
            body["cover_image_url"] = self.cover_image_url
        if self.key_numbers is not None:
            body["key_numbers"] = self.key_numbers
        if self.data_sources_count is not None:
            body["data_sources_count"] = self.data_sources_count
        if self.source_run_id is not None:
            body["source_run_id"] = self.source_run_id
        if self.captured_at is not None:
            body["captured_at"] = self.captured_at.isoformat()
        return body


@dataclass(frozen=True)
class TrackPublishResult:
    """后端返回结果。"""

    slug: str
    track_keyword: str
    published_at: str | None
    response: dict[str, Any] = field(default_factory=dict)


def _resolve_reports_dir(workspace: Path) -> Path:
    """workspace 可能直接是 ``<track>/reports/<run_id>``、``<track>/reports`` 或 ``<track>``。"""

    if (workspace / "index.json").is_file():
        return workspace.parent  # 已经指向 run 目录，回退一层
    if (workspace / "reports").is_dir():
        return workspace / "reports"
    raise PublishError(
        f"workspace 中找不到 reports 目录：{workspace}（也未直接指向 run 目录）"
    )


def _pick_run_dir(reports_dir: Path, run_id: str | None) -> Path:
    if run_id is not None:
        candidate = reports_dir / run_id
        if not candidate.is_dir():
            raise PublishError(f"指定的 run 目录不存在：{candidate}")
        return candidate
    children = [child for child in reports_dir.iterdir() if child.is_dir()]
    if not children:
        raise PublishError(f"reports 目录中没有任何 run：{reports_dir}")
    children.sort(key=lambda p: p.name, reverse=True)
    return children[0]


def _read_index(report_dir: Path) -> dict[str, Any]:
    index_path = report_dir / "index.json"
    if not index_path.is_file():
        raise PublishError(f"缺少 index.json：{index_path}")
    try:
        payload = json.loads(index_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise PublishError(f"index.json 解析失败：{index_path}：{exc}") from exc
    if not isinstance(payload, dict):
        raise PublishError(f"index.json 顶层必须是对象：{index_path}")
    return payload


def _parse_captured_at(value: Any) -> datetime | None:
    if value is None or not isinstance(value, str):
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
        return parsed.replace(tzinfo=timezone.utc).replace(tzinfo=None)
    return parsed.astimezone(timezone.utc).replace(tzinfo=None)


def _normalize_key_numbers(raw: Any) -> dict[str, float] | None:
    if raw is None:
        return None
    if not isinstance(raw, dict):
        raise PublishError("index.json.key_numbers 必须是对象")
    normalized: dict[str, float] = {}
    for k, v in raw.items():
        if not isinstance(k, str):
            raise PublishError("index.json.key_numbers 的键必须是字符串")
        if isinstance(v, bool):
            raise PublishError(f"index.json.key_numbers[{k}] 不接受 bool")
        if not isinstance(v, (int, float)):
            raise PublishError(
                f"index.json.key_numbers[{k}] 必须是数字，实际：{type(v).__name__}"
            )
        normalized[k] = float(v)
    return normalized


def _build_reports(
    *, run_dir: Path, index: dict[str, Any]
) -> tuple[tuple[TrackReportPayload, ...], str | None]:
    raw_reports = index.get("reports")
    if not isinstance(raw_reports, list) or not raw_reports:
        raise PublishError("index.json.reports 必须是非空数组")

    items: list[TrackReportPayload] = []
    seen_keys: set[str] = set()
    for idx, entry in enumerate(raw_reports):
        if not isinstance(entry, dict):
            raise PublishError(f"index.json.reports[{idx}] 必须是对象")
        try:
            file_name = str(entry["file"])
            title = str(entry["title"])
            type_ = str(entry["type"])
            sections = int(entry.get("sections", 0))
            charts = int(entry.get("charts", 0))
        except (KeyError, TypeError, ValueError) as exc:
            raise PublishError(
                f"index.json.reports[{idx}] 缺少必要字段或类型错误：{entry}"
            ) from exc

        description = entry.get("description", "")
        if not isinstance(description, str):
            description = ""

        if type_ not in _KNOWN_REPORT_TYPES:
            _LOGGER.warning(
                "未知的 report type=%s（已知：%s），仍按原 type 作为 key 写入",
                type_,
                ", ".join(sorted(_KNOWN_REPORT_TYPES)),
            )

        if type_ in seen_keys:
            raise PublishError(
                f"index.json.reports 中重复的 type/key：{type_}（每个 type 只能出现一次）"
            )
        seen_keys.add(type_)

        html_path = run_dir / file_name
        if not html_path.is_file():
            raise PublishError(f"报告 HTML 不存在：{html_path}")
        raw_bytes = html_path.read_bytes()
        if len(raw_bytes) > MAX_SINGLE_REPORT_HTML_BYTES:
            raise PublishError(
                f"报告 HTML 体积超过 {MAX_SINGLE_REPORT_HTML_BYTES} 字节："
                f"{html_path}（{len(raw_bytes)}）"
            )
        html_text = raw_bytes.decode("utf-8")

        items.append(
            TrackReportPayload(
                key=type_,
                title=title,
                type=type_,
                sections=sections,
                charts=charts,
                description=description,
                html=html_text,
            )
        )

    run_id_value = index.get("run_id")
    source_run_id = (
        run_id_value.strip()
        if isinstance(run_id_value, str) and run_id_value.strip()
        else run_dir.name
    )
    return tuple(items), source_run_id


def load_track_publish_payload(
    *,
    workspace: Path,
    run_id: str | None = None,
    slug_override: str | None = None,
    industry_override: str | None = None,
    extra_tags: tuple[str, ...] = (),
    cover_image_url: str | None = None,
    is_free: bool = False,
    status: str = "published",
) -> TrackAnalysisPayload:
    """从 workspace 加载赛道分析 payload。

    workspace 既可指向 ``output/tracks/<slug>``，也可直接指向 ``reports/<run_id>``
    或 ``reports`` 目录。
    """

    if not workspace.exists():
        raise PublishError(f"workspace 不存在：{workspace}")

    # 兼容直接传入 run 目录
    if (workspace / "index.json").is_file():
        run_dir = workspace
        # workspace 上溯：reports/<run_id> -> reports -> track_root
        track_root = workspace.parent.parent
    else:
        reports_dir = _resolve_reports_dir(workspace)
        run_dir = _pick_run_dir(reports_dir, run_id)
        track_root = reports_dir.parent

    index = _read_index(run_dir)

    track_slug_from_index = index.get("track_slug")
    slug = (
        slug_override.strip()
        if slug_override and slug_override.strip()
        else (
            track_slug_from_index.strip()
            if isinstance(track_slug_from_index, str) and track_slug_from_index.strip()
            else track_root.name
        )
    )

    track_keyword = index.get("track_keyword")
    if not isinstance(track_keyword, str) or track_keyword.strip() == "":
        raise PublishError("index.json 缺少 track_keyword")

    region = index.get("region")
    if not isinstance(region, str) or region.strip() == "":
        raise PublishError("index.json 缺少 region")

    audience = index.get("audience")
    if not isinstance(audience, str) or audience.strip() == "":
        raise PublishError("index.json 缺少 audience")

    stance_raw = index.get("stance")
    stance = stance_raw.strip() if isinstance(stance_raw, str) and stance_raw.strip() else None
    stance_summary_raw = index.get("stance_summary")
    stance_summary = (
        stance_summary_raw.strip()
        if isinstance(stance_summary_raw, str) and stance_summary_raw.strip()
        else None
    )

    industry = (
        industry_override.strip()
        if industry_override and industry_override.strip()
        else None
    )

    data_sources_count_raw = index.get("data_sources_count")
    data_sources_count = (
        int(data_sources_count_raw)
        if isinstance(data_sources_count_raw, int)
        else None
    )

    key_numbers = _normalize_key_numbers(index.get("key_numbers"))
    captured_at = _parse_captured_at(index.get("generated_at"))

    reports, source_run_id = _build_reports(run_dir=run_dir, index=index)

    tag_seen: set[str] = set()
    tags_normalized: list[str] = []
    for raw_tag in extra_tags:
        if not isinstance(raw_tag, str):
            continue
        stripped = raw_tag.strip()
        if stripped == "" or stripped in tag_seen:
            continue
        tag_seen.add(stripped)
        tags_normalized.append(stripped)

    return TrackAnalysisPayload(
        slug=slug,
        track_keyword=track_keyword.strip(),
        region=region.strip(),
        audience=audience.strip(),
        industry=industry,
        stance=stance,
        stance_summary=stance_summary,
        cover_image_url=cover_image_url,
        tags=tuple(tags_normalized),
        key_numbers=key_numbers,
        data_sources_count=data_sources_count,
        reports=reports,
        source_run_id=source_run_id,
        captured_at=captured_at,
        is_free=is_free,
        status=status,
    )


def resolve_track_publish_target(
    *,
    env_name: str | None,
    api_base_override: str | None,
    token_override: str | None,
    envs_file: Path | None,
) -> ResolvedTarget:
    """与博主版本类似的环境解析，但 token 来自 track 专用 env var。

    优先级：
    1. CLI 显式 ``--api-base`` / ``--token``；
    2. 选中环境（``--env`` / ``RESEARCH_KIT_PUBLISH_ENV`` / 文件 ``default``）的
       ``api_base``；token 从环境变量 ``WEELUME_TRACK_ANALYSIS_IMPORT_TOKEN``
       或 ``track_token_env`` 字段（如果 publish-envs.toml 定义了）读取；
    3. 兜底 ``WEELUME_API_BASE`` / ``WEELUME_TRACK_ANALYSIS_IMPORT_TOKEN``。
    """

    api_base_value = api_base_override.strip() if api_base_override else None
    token_value = token_override.strip() if token_override else None

    config_path = find_envs_file(envs_file)
    config = load_envs_config(config_path) if config_path is not None else None

    effective_env_name: str | None
    if env_name is not None and env_name.strip() != "":
        effective_env_name = env_name.strip()
    else:
        env_var = os.environ.get(PUBLISH_ENV_VAR)
        if env_var and env_var.strip() != "":
            effective_env_name = env_var.strip()
        elif config is not None:
            effective_env_name = config.default
        else:
            effective_env_name = None

    selected_env: PublishEnvironment | None = None
    track_token_env_var: str | None = None
    if effective_env_name is not None:
        if config is None:
            raise PublishError(
                f"指定了环境 {effective_env_name!r}，但未找到 publish-envs.toml"
            )
        if effective_env_name not in config.envs:
            available = ", ".join(sorted(config.envs)) or "(空)"
            raise PublishError(
                f"未找到名为 {effective_env_name!r} 的环境，可选：{available}"
            )
        selected_env = config.envs[effective_env_name]
        # 从原始 TOML 表中读取可选的 track_token_env（PublishEnvironment 当前
        # 只承载 token_env；这里直接重读文件比扩展 dataclass 字段更稳妥）。
        try:
            import tomllib

            with config.source.open("rb") as fh:
                raw = tomllib.load(fh)
            envs_section = raw.get("envs") or {}
            env_block = envs_section.get(effective_env_name) or {}
            raw_track_token_env = env_block.get("track_token_env")
            if isinstance(raw_track_token_env, str) and raw_track_token_env.strip():
                track_token_env_var = raw_track_token_env.strip()
        except (OSError, tomllib.TOMLDecodeError) as exc:
            raise PublishError(
                f"重读 publish-envs.toml 失败：{config.source}：{exc}"
            ) from exc

    if api_base_value is None:
        if selected_env is not None:
            api_base_value = selected_env.api_base
        else:
            fallback = os.environ.get(DEFAULT_API_BASE_ENV_VAR, "").strip()
            if fallback:
                api_base_value = fallback

    if not api_base_value:
        raise PublishError(
            "未能解析 api_base：请显式传 --api-base，或通过 --env 选择 publish-envs.toml"
        )

    if token_value is None:
        effective_token_env_var = (
            track_token_env_var
            if track_token_env_var is not None
            else DEFAULT_TRACK_TOKEN_ENV_VAR
        )
        candidate = os.environ.get(effective_token_env_var, "").strip()
        if candidate:
            token_value = candidate

    if not token_value:
        hint_env_var = (
            track_token_env_var
            if track_token_env_var is not None
            else DEFAULT_TRACK_TOKEN_ENV_VAR
        )
        raise PublishError(
            f"未能解析 track import token：请显式传 --token，或确保环境变量 "
            f"{hint_env_var} 已设置（也可在 publish-envs.toml 中给所选环境加上 "
            f"track_token_env=\"<your-env-var>\"）。"
        )

    final_env_name = (
        selected_env.name if selected_env is not None else effective_env_name
    )
    _LOGGER.debug(
        "resolved track publish target env=%s api_base=%s token_len=%d",
        final_env_name,
        api_base_value,
        len(token_value),
    )
    return ResolvedTarget(
        api_base=api_base_value,
        token=token_value,
        env_name=final_env_name,
    )


def publish_track_analysis(
    *,
    payload: TrackAnalysisPayload,
    api_base: str,
    token: str,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
) -> TrackPublishResult:
    """通过 HTTP 上传 track payload 到后端。"""

    api_base = api_base.rstrip("/")
    if api_base == "":
        raise PublishError("api_base 不能为空")
    if token.strip() == "":
        raise PublishError("token 不能为空")

    url = f"{api_base}/api/v1/track-analyses/import"
    body = payload.to_request_body()
    headers = {
        "X-Import-Token": token.strip(),
        "Content-Type": "application/json",
    }

    _LOGGER.info(
        "publish track analysis slug=%s keyword=%s reports=%d url=%s",
        payload.slug,
        payload.track_keyword,
        len(payload.reports),
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

    return TrackPublishResult(
        slug=str(data.get("slug", payload.slug)),
        track_keyword=str(data.get("track_keyword", payload.track_keyword)),
        published_at=(
            str(data["published_at"])
            if isinstance(data.get("published_at"), str)
            else None
        ),
        response=envelope,
    )


__all__ = [
    "DEFAULT_TRACK_TOKEN_ENV_VAR",
    "TrackAnalysisPayload",
    "TrackPublishResult",
    "TrackReportPayload",
    "load_track_publish_payload",
    "publish_track_analysis",
    "resolve_track_publish_target",
]
