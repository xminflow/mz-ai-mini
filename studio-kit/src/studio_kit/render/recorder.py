"""通用 Patchright 录屏：HTML → 定长 mp4。分辨率与背景可配。

抽象自 slide_renderer 的录屏写法，供 arch 横版复用。slide_renderer 暂不改动。
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import ffmpeg

from studio_kit.core.logging import get_logger

logger = get_logger(__name__)


async def _record(
    html_path: Path,
    out_mp4: Path,
    duration_ms: int,
    webm_dir: Path,
    width: int,
    height: int,
    bg_rgb: tuple[int, int, int],
) -> None:
    from patchright.async_api import async_playwright

    webm_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": width, "height": height},
            record_video_dir=str(webm_dir),
            record_video_size={"width": width, "height": height},
        )
        page = await ctx.new_page()

        # CDP 背景覆盖：防止页面加载前的默认白底进入录屏首帧
        client = await ctx.new_cdp_session(page)
        r, g, b = bg_rgb
        await client.send(
            "Emulation.setDefaultBackgroundColorOverride",
            {"color": {"r": r, "g": g, "b": b, "a": 1.0}},
        )

        await page.goto(html_path.as_uri(), wait_until="load", timeout=15000)
        await page.wait_for_timeout(duration_ms + 300)

        video = page.video
        await ctx.close()

        if video is None:
            raise RuntimeError(f"录屏失败：无 video 对象，html={html_path}")

        webm_path = Path(await video.path())

    logger.debug("webm 录制完成：%s，开始转 mp4", webm_path)

    (
        ffmpeg.input(str(webm_path))
        .output(str(out_mp4), vcodec="libx264", pix_fmt="yuv420p", r=30)
        .overwrite_output()
        .run(quiet=True)
    )
    webm_path.unlink(missing_ok=True)
    logger.info("片段 mp4 已生成：%s", out_mp4)


def record_html_to_mp4(
    html_path: Path,
    out_mp4: Path,
    duration_ms: int,
    webm_dir: Path,
    *,
    width: int,
    height: int,
    bg_rgb: tuple[int, int, int],
) -> None:
    """同步包装：录制单个 HTML 为定长 mp4。"""
    asyncio.run(_record(html_path, out_mp4, duration_ms, webm_dir, width, height, bg_rgb))
