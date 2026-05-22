"""单条抖音视频元数据提取。

复用 iesdouyin.com 分享页的 iPhone UA fetch 路径（与 download.py 相同），
但提取 item_list[0] 的完整字段：标题、作者、时长、播放/点赞/评论/分享数等。
所有统计字段允许 None（抖音不保证在分享页接口返回统计数据）。
"""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone

import httpx

from research_kit.core.logging import get_logger

_log = get_logger(__name__)

_MOBILE_USER_AGENT = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) "
    "EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1"
)
_FETCH_TIMEOUT = 8.0
_VIDEO_ID_PATTERNS = [
    re.compile(r"(?:video|note)/(\d{18,20})"),
    re.compile(r"modal_id=(\d{18,20})"),
    re.compile(r"(\d{18,20})"),
]
_ROUTER_DATA_RE = re.compile(r"window\._ROUTER_DATA\s*=\s*(.*?)</script>", re.DOTALL)


@dataclass(slots=True)
class VideoMeta:
    aweme_id: str
    title: str
    author_name: str
    author_douyin_id: str | None
    author_sec_uid: str | None
    duration_seconds: float
    play_count: int | None
    digg_count: int | None       # 点赞数
    comment_count: int | None
    share_count: int | None
    collect_count: int | None    # 收藏数
    cover_url: str | None
    create_time: int | None      # unix timestamp
    video_url: str               # 去水印 mp4 直链
    page_url: str                # 原始输入 URL
    captured_at: str             # ISO 8601

    def to_dict(self) -> dict:
        return asdict(self)


def fetch_video_meta(page_url: str, *, proxy: str | None = None) -> VideoMeta:
    """从 iesdouyin 分享页提取单视频完整元数据。

    算法与 download.py 的 resolve_douyin_video_mp4_url 一致，
    额外提取 item_list[0] 的完整统计数据和作者信息。
    失败时抛 RuntimeError。
    """
    headers = {"User-Agent": _MOBILE_USER_AGENT}
    client_kwargs: dict = {
        "headers": headers,
        "timeout": _FETCH_TIMEOUT,
        "follow_redirects": True,
    }
    if proxy:
        client_kwargs["proxy"] = proxy

    aweme_id = _extract_aweme_id(page_url)
    if not aweme_id:
        # 短链（v.douyin.com/xxx）：跟随重定向后才能拿到 aweme_id
        try:
            with httpx.Client(**client_kwargs) as client:
                resp = client.get(page_url)
                aweme_id = _extract_aweme_id(str(resp.url))
        except Exception as exc:
            raise RuntimeError(f"短链解析失败 {page_url}: {exc}") from exc
    if not aweme_id:
        raise RuntimeError(f"无法从 URL 提取 aweme_id: {page_url}")

    share_url = f"https://www.iesdouyin.com/share/video/{aweme_id}"
    try:
        with httpx.Client(**client_kwargs) as client:
            resp = client.get(share_url)
            if resp.status_code != 200:
                raise RuntimeError(f"iesdouyin 返回 {resp.status_code}: {share_url}")
            html = resp.text
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"iesdouyin fetch 失败 {share_url}: {exc}") from exc

    match = _ROUTER_DATA_RE.search(html)
    if not match:
        raise RuntimeError(f"未在 iesdouyin HTML 中找到 _ROUTER_DATA: {share_url}")

    json_text = match.group(1).strip()
    if json_text.endswith(";"):
        json_text = json_text[:-1]

    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"_ROUTER_DATA JSON 解析失败: {exc}") from exc

    try:
        item = data["loaderData"]["video_(id)/page"]["videoInfoRes"]["item_list"][0]
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"_ROUTER_DATA 字段路径未命中: {exc}") from exc

    try:
        play_url: str = item["video"]["play_addr"]["url_list"][0]
        play_url = play_url.replace("playwm", "play")
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(f"无法提取 play_addr URL: {exc}") from exc

    stats = item.get("statistics") or {}
    video_obj = item.get("video") or {}
    author = item.get("author") or {}

    duration_ms: int = video_obj.get("duration") or 0
    cover_list: list = (video_obj.get("cover") or {}).get("url_list") or []

    return VideoMeta(
        aweme_id=aweme_id,
        title=str(item.get("desc") or ""),
        author_name=str(author.get("nickname") or ""),
        author_douyin_id=author.get("unique_id") or None,
        author_sec_uid=author.get("sec_uid") or None,
        duration_seconds=duration_ms / 1000.0,
        play_count=_safe_int(stats.get("play_count")),
        digg_count=_safe_int(stats.get("digg_count")),
        comment_count=_safe_int(stats.get("comment_count")),
        share_count=_safe_int(stats.get("share_count")),
        collect_count=_safe_int(stats.get("collect_count")),
        cover_url=cover_list[0] if cover_list else None,
        create_time=_safe_int(item.get("create_time")),
        video_url=play_url,
        page_url=page_url,
        captured_at=datetime.now(timezone.utc).isoformat(),
    )


def _extract_aweme_id(url: str) -> str | None:
    if not isinstance(url, str) or not url:
        return None
    for pat in _VIDEO_ID_PATTERNS:
        m = pat.search(url)
        if m:
            return m.group(1)
    return None


def _safe_int(value: object) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


__all__ = ["VideoMeta", "fetch_video_meta"]
