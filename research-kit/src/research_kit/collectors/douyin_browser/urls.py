"""抖音 URL 规范化与 aweme_id 提取。"""

from __future__ import annotations

import re
from urllib.parse import urlparse, urlunparse

_VIDEO_PATH_RE = re.compile(r"^/video/(\d+)")
_USER_PATH_RE = re.compile(r"^/user/([^/?#]+)")


def _ensure_scheme(url: str) -> str:
    """补全 scheme：`//xxx` -> `https://xxx`；裸 host 也补 https://。"""
    if url.startswith(("http://", "https://")):
        return url
    if url.startswith("//"):
        return "https:" + url
    return "https://" + url


def canonicalize_video_url(url: str) -> str | None:
    """把作品 URL 规范化为 `https://www.douyin.com/video/<aweme_id>`。"""
    aweme_id = extract_aweme_id(url)
    if aweme_id is None:
        return None
    return f"https://www.douyin.com/video/{aweme_id}"


def extract_aweme_id(url: str) -> str | None:
    """从作品 URL 中提取 aweme_id。"""
    if not url:
        return None
    parsed = urlparse(_ensure_scheme(url))
    match = _VIDEO_PATH_RE.match(parsed.path)
    if match is None:
        return None
    return match.group(1)


def extract_sec_uid(url: str) -> str | None:
    """从博主主页 URL 中提取 sec_uid。"""
    if not url:
        return None
    parsed = urlparse(_ensure_scheme(url))
    match = _USER_PATH_RE.match(parsed.path)
    if match is None:
        return None
    return match.group(1)


def normalize_profile_url(url: str) -> str:
    """主页 URL 规范化：去 query string，统一 host 与 scheme。"""
    if not url:
        raise ValueError("主页 URL 不能为空")
    parsed = urlparse(_ensure_scheme(url))
    return urlunparse(("https", parsed.netloc or "www.douyin.com", parsed.path, "", "", ""))


__all__ = [
    "canonicalize_video_url",
    "extract_aweme_id",
    "extract_sec_uid",
    "normalize_profile_url",
]
