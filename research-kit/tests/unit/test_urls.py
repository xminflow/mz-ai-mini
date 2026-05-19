"""抖音 URL 规范化与 ID 提取。"""

from __future__ import annotations

from research_kit.collectors.douyin_browser.urls import (
    canonicalize_video_url,
    extract_aweme_id,
    extract_sec_uid,
    normalize_profile_url,
)


def test_canonicalize_video_url() -> None:
    assert canonicalize_video_url("https://www.douyin.com/video/7123456789") == "https://www.douyin.com/video/7123456789"
    # 带 query string
    assert canonicalize_video_url("https://www.douyin.com/video/7123456789?from=share") == "https://www.douyin.com/video/7123456789"
    # 相对路径补全
    assert canonicalize_video_url("//www.douyin.com/video/7123456789") == "https://www.douyin.com/video/7123456789"


def test_canonicalize_returns_none_for_invalid() -> None:
    assert canonicalize_video_url("") is None
    assert canonicalize_video_url("https://www.douyin.com/user/abc") is None
    assert canonicalize_video_url("not-a-url") is None


def test_extract_aweme_id() -> None:
    assert extract_aweme_id("https://www.douyin.com/video/7123456789") == "7123456789"
    assert extract_aweme_id("https://www.douyin.com/video/7123456789?x=1") == "7123456789"
    assert extract_aweme_id("https://www.douyin.com/user/abc") is None


def test_extract_sec_uid() -> None:
    assert extract_sec_uid("https://www.douyin.com/user/MS4wLjABAAAAxxx") == "MS4wLjABAAAAxxx"
    assert extract_sec_uid("https://www.douyin.com/user/MS4wLjABAAAAxxx?tab=post") == "MS4wLjABAAAAxxx"
    assert extract_sec_uid("https://www.douyin.com/video/123") is None


def test_normalize_profile_url() -> None:
    assert (
        normalize_profile_url("https://www.douyin.com/user/abc?tab=post")
        == "https://www.douyin.com/user/abc"
    )
    # 不带 scheme
    assert normalize_profile_url("www.douyin.com/user/abc") == "https://www.douyin.com/user/abc"
