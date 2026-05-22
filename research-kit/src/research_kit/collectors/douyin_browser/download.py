"""抖音作品视频下载。

完全照搬 ua-agent 的实现思路（从 ua-agent/frontend/src/main/services/douyin/resolve-video-url.ts
移植到 Python）：

1. 从作品 URL 中正则提取 aweme_id（18-20 位数字）
   - 短链（v.douyin.com/xxx）先 HEAD/GET 跟随重定向
2. fetch https://www.iesdouyin.com/share/video/<aweme_id>（带 iPhone Safari UA）
3. 在响应 HTML 中正则提取 `window._ROUTER_DATA = ...</script>` 的 JSON 块
4. 取 `loaderData["video_(id)/page"].videoInfoRes.item_list[0].video.play_addr.url_list[0]`
5. 把 URL 中的 `playwm` 替换为 `play`（去水印）
6. httpx 流式下载到目标文件

这条路径**不需要 cookies、不需要登录态、不处理 DASH 分段**——抖音对带 iPhone UA 的
iesdouyin 分享页直接返回单文件 mp4 直链。
"""

from __future__ import annotations

import json
import random
import re
import time
from pathlib import Path

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


def extract_aweme_id(url: str) -> str | None:
    """从 URL 中尝试匹配 18-20 位数字 aweme_id。"""
    if not isinstance(url, str) or not url:
        return None
    for pat in _VIDEO_ID_PATTERNS:
        m = pat.search(url)
        if m:
            return m.group(1)
    return None


def resolve_douyin_video_mp4_url(
    page_url: str,
    *,
    proxy: str | None = None,
) -> str | None:
    """把一个抖音作品页 URL 解析为可直接下载的 mp4 URL（已去水印）。

    若失败返回 None。失败原因（短链解开失败 / iesdouyin 没返回 _ROUTER_DATA / 字段缺失）
    都在日志里能看到。
    """
    if not isinstance(page_url, str) or not page_url:
        return None

    headers = {"User-Agent": _MOBILE_USER_AGENT}
    client_kwargs: dict = {"headers": headers, "timeout": _FETCH_TIMEOUT, "follow_redirects": True}
    if proxy:
        client_kwargs["proxy"] = proxy

    aweme_id = extract_aweme_id(page_url)
    if not aweme_id:
        # 短链：v.douyin.com/xxx 跟随重定向后能拿到 18-20 位 id
        try:
            with httpx.Client(**client_kwargs) as client:
                resp = client.get(page_url)
                aweme_id = extract_aweme_id(str(resp.url))
        except Exception as exc:
            _log.warning("短链解析失败 %s: %s", page_url, exc)
            return None
    if not aweme_id:
        _log.warning("无法从 URL 提取 aweme_id: %s", page_url)
        return None

    share_url = f"https://www.iesdouyin.com/share/video/{aweme_id}"
    try:
        with httpx.Client(**client_kwargs) as client:
            resp = client.get(share_url)
            if resp.status_code != 200:
                _log.warning("iesdouyin 返回 %d for %s", resp.status_code, share_url)
                return None
            html = resp.text
    except Exception as exc:
        _log.warning("iesdouyin fetch 失败 %s: %s", share_url, exc)
        return None

    match = _ROUTER_DATA_RE.search(html)
    if not match:
        _log.warning("未在 iesdouyin HTML 中找到 _ROUTER_DATA: %s", share_url)
        return None

    json_text = match.group(1).strip()
    if json_text.endswith(";"):
        json_text = json_text[:-1]

    try:
        data = json.loads(json_text)
    except json.JSONDecodeError as exc:
        _log.warning("_ROUTER_DATA JSON 解析失败 %s: %s", share_url, exc)
        return None

    try:
        item = data["loaderData"]["video_(id)/page"]["videoInfoRes"]["item_list"][0]
        play_url = item["video"]["play_addr"]["url_list"][0]
    except (KeyError, IndexError, TypeError) as exc:
        _log.warning("_ROUTER_DATA 字段路径未命中 %s: %s", share_url, exc)
        return None

    if not isinstance(play_url, str) or not play_url:
        return None

    # playwm → play 去水印（ua-agent 同款变换）
    return play_url.replace("playwm", "play")


def _exponential_backoff(attempt: int, base_range: tuple[float, float]) -> float:
    """指数退避：第 attempt 次失败后等待的秒数。

    factor = 2 ** (attempt - 1)，最高封顶 4 倍——避免极端情况单条卡死。
    例：base=(15, 30) 时实际等待区间为：
        attempt=1 → 15-30s；attempt=2 → 30-60s；attempt=3+ → 60-120s。
    """
    factor = min(2 ** (attempt - 1), 4)
    return random.uniform(base_range[0] * factor, base_range[1] * factor)


def download_video(
    page_url: str,
    output_path: Path,
    *,
    proxy: str | None = None,
    cookies_path: Path | None = None,  # 保留兼容性，本路径不用
    cookies_from_browser_dir: Path | None = None,  # 保留兼容性，本路径不用
    timeout_seconds: int = 120,
    max_retries: int = 5,
    retry_backoff_seconds: tuple[float, float] = (15.0, 30.0),
) -> Path:
    """下载抖音作品视频到 `output_path`。失败抛 RuntimeError。

    流程：page URL → iesdouyin 解析 → 流式下载 mp4。

    针对抖音 mp4 直链的反爬限速（HTTP 403）做重试：
    - max_retries：最多尝试次数（含首次）。默认 5 次。
    - retry_backoff_seconds：第一次重试前的随机等待区间（秒）。后续重试按指数退避增长
      （factor=1/2/4/4 封顶），并且重新调 iesdouyin 解析拿一个**新的**带签名 mp4 URL
      （同一个 URL 可能在窗口内被持续限速）。
      抖音的限速窗口往往在 15-60s 量级，这个默认值是按那个窗口校准的。
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    headers = {
        "User-Agent": _MOBILE_USER_AGENT,
        "Referer": "https://www.iesdouyin.com/",
    }
    client_kwargs: dict = {
        "headers": headers,
        "timeout": timeout_seconds,
        "follow_redirects": True,
    }
    if proxy:
        client_kwargs["proxy"] = proxy

    last_exc: Exception | None = None
    last_status: int | None = None
    for attempt in range(1, max_retries + 1):
        try:
            # 每次重试都重新解析 mp4 URL（签名 URL 可能短时间内一直被限速）
            mp4_url = resolve_douyin_video_mp4_url(page_url, proxy=proxy)
            if not mp4_url:
                raise RuntimeError(f"无法解析视频 mp4 URL：{page_url}")

            _log.info(
                "下载尝试 %d/%d: %s -> %s",
                attempt,
                max_retries,
                _short(mp4_url),
                output_path.name,
            )

            with httpx.Client(**client_kwargs) as client:
                with client.stream("GET", mp4_url) as resp:
                    last_status = resp.status_code
                    if resp.status_code != 200:
                        _log.warning(
                            "下载 HTTP %d（尝试 %d/%d）: %s",
                            resp.status_code,
                            attempt,
                            max_retries,
                            _short(mp4_url),
                        )
                        # 触发重试（不写文件，下面循环 sleep + 重新解析）
                        if attempt < max_retries:
                            wait = _exponential_backoff(attempt, retry_backoff_seconds)
                            _log.info("等待 %.1fs 后重试（指数退避 attempt=%d）…", wait, attempt)
                            time.sleep(wait)
                            continue
                        raise RuntimeError(
                            f"下载失败 HTTP {resp.status_code}：{_short(mp4_url)}"
                        )

                    total_bytes = 0
                    with output_path.open("wb") as fh:
                        for chunk in resp.iter_bytes(chunk_size=64 * 1024):
                            if chunk:
                                fh.write(chunk)
                                total_bytes += len(chunk)

            if not output_path.exists() or output_path.stat().st_size == 0:
                raise RuntimeError(f"下载完成但文件为空：{output_path}")
            _log.debug("下载完成 %s, %d bytes（尝试 %d）", output_path.name, total_bytes, attempt)
            return output_path
        except httpx.HTTPError as exc:
            last_exc = exc
            _log.warning("下载网络错误（尝试 %d/%d）: %s", attempt, max_retries, exc)
            if attempt < max_retries:
                wait = _exponential_backoff(attempt, retry_backoff_seconds)
                _log.info("等待 %.1fs 后重试（指数退避 attempt=%d）…", wait, attempt)
                time.sleep(wait)
                continue
            raise RuntimeError(f"下载失败 {page_url}: {exc}") from exc

    # 重试用尽（最后一次是 HTTP 非 200 但没抛 httpx 异常的情况）
    if last_status is not None:
        raise RuntimeError(
            f"重试 {max_retries} 次仍失败，最后状态 HTTP {last_status}：{page_url}"
        )
    if last_exc is not None:
        raise RuntimeError(f"重试 {max_retries} 次仍失败：{last_exc}") from last_exc
    raise RuntimeError(f"重试 {max_retries} 次仍失败（未知原因）：{page_url}")


def _short(url: str) -> str:
    """日志里显示截短的 URL，避免签名串太长污染日志。"""
    if len(url) <= 80:
        return url
    return url[:60] + "...(+" + str(len(url) - 60) + ")"


__all__ = ["download_video", "extract_aweme_id", "resolve_douyin_video_mp4_url"]
