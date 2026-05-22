"""幻灯片渲染器：HTML 模板注入 + Patchright 录屏 → mp4。

流程：
  1. 从 templates/ 读对应 slide_type 的 .html.tmpl
  2. 字符串替换（{{field}}）生成 slides/NN.html
  3. Patchright record_video_dir 模式录屏 → webm
  4. ffmpeg 把 webm 转成 NN.mp4
"""
from __future__ import annotations

import asyncio
import json
import re
from pathlib import Path
from typing import Any

import ffmpeg

from studio_kit.core.contracts import ScriptDoc, SlideItem
from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

# templates 目录：studio-kit/.claude/skills/blogger-breakdown-shortvideo/templates/
# parents[3] = studio-kit/（src/studio_kit/render/slide_renderer.py 上溯 4 级）
_TEMPLATE_DIR = (
    Path(__file__).resolve().parents[3]
    / ".claude"
    / "skills"
    / "blogger-breakdown-shortvideo"
    / "templates"
)


def _get_template_dir() -> Path:
    """返回模板目录，开发期可通过环境变量 STUDIO_KIT_TEMPLATE_DIR 覆盖。"""
    import os
    override = os.environ.get("STUDIO_KIT_TEMPLATE_DIR")
    if override:
        return Path(override)
    return _TEMPLATE_DIR


def _load_template(slide_type: str) -> str:
    """加载对应 slide_type 的 HTML 模板。文件名约定：slide-<slide_type>.html.tmpl。"""
    tmpl_path = _get_template_dir() / f"slide-{slide_type}.html.tmpl"
    if not tmpl_path.exists():
        raise FileNotFoundError(
            f"找不到模板文件：{tmpl_path}"
        )
    return tmpl_path.read_text(encoding="utf-8")


def _bullets_to_html(bullets: list[str]) -> str:
    """把 bullets 列表转成 <ul><li>...</li></ul>。"""
    if not bullets:
        return ""
    items = "".join(f"<li>{b}</li>" for b in bullets)
    return f"<ul>{items}</ul>"


def generate_slide_html(slide: SlideItem, out_html: Path) -> None:
    """根据 SlideItem 渲染 HTML 并写到 out_html。"""
    template = _load_template(slide.slide_type)

    # 计算估算时长（毫秒），用于注入到模板的 DURATION_MS 占位
    duration_ms = int(slide.duration_estimate_s * 1000) if slide.duration_estimate_s > 0 else 5000

    replacements: dict[str, str] = {
        "{{narration}}": slide.narration,
        "{{title}}": slide.title,
        "{{bullets_html}}": _bullets_to_html(slide.bullets),
        "{{quote}}": slide.quote,
        "{{compare_before}}": slide.compare_before,
        "{{compare_after}}": slide.compare_after,
        "{{DURATION_MS}}": str(duration_ms),
        "{{index}}": str(slide.index),
        "{{slide_type}}": slide.slide_type,
        # cover 专用
        "{{subtitle}}": slide.subtitle,
        "{{verdict}}": slide.verdict or slide.quote,
        # stats 专用
        "{{stat_1_label}}": slide.stat_1_label,
        "{{stat_1_value}}": slide.stat_1_value,
        "{{stat_2_label}}": slide.stat_2_label,
        "{{stat_2_value}}": slide.stat_2_value,
        "{{stat_3_label}}": slide.stat_3_label,
        "{{stat_3_value}}": slide.stat_3_value,
        "{{extra}}": slide.extra,
        "{{source}}": slide.title or "",
    }

    html = template
    for placeholder, value in replacements.items():
        html = html.replace(placeholder, value)

    out_html.parent.mkdir(parents=True, exist_ok=True)
    out_html.write_text(html, encoding="utf-8")
    logger.debug("幻灯片 HTML 已写出：%s", out_html)


async def _record_slide(
    html_path: Path,
    out_mp4: Path,
    duration_ms: int,
    webm_dir: Path,
) -> None:
    """用 Patchright 录制单张幻灯片，输出 mp4。"""
    from patchright.async_api import async_playwright

    webm_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": 1080, "height": 1920},
            record_video_dir=str(webm_dir),
            record_video_size={"width": 1080, "height": 1920},
        )
        page = await ctx.new_page()

        file_url = html_path.as_uri()
        await page.goto(file_url, wait_until="networkidle", timeout=15000)
        # 注入时长，模板中的动画 JS 可读取此值
        await page.evaluate(f"window.STUDIO_KIT_DURATION_MS = {duration_ms}")
        # 等待动画播放完成
        await page.wait_for_timeout(duration_ms + 300)

        video = page.video
        await ctx.close()

        if video is None:
            raise RuntimeError(f"录屏失败：没有 video 对象，html={html_path}")

        webm_path = Path(await video.path())

    logger.debug("webm 录制完成：%s，开始转 mp4", webm_path)

    # 把 webm 转成 h264 mp4
    (
        ffmpeg
        .input(str(webm_path))
        .output(
            str(out_mp4),
            vcodec="libx264",
            pix_fmt="yuv420p",
            r=30,
        )
        .overwrite_output()
        .run(quiet=True)
    )
    webm_path.unlink(missing_ok=True)
    logger.info("幻灯片 mp4 已生成：%s", out_mp4)


def _slide_index_str(index: int) -> str:
    return f"{index:02d}"


def render_all_slides(
    script: ScriptDoc,
    audio_dir: Path,
    slides_dir: Path,
    *,
    force: bool = False,
) -> list[Path]:
    """
    渲染所有幻灯片 mp4。

    对每个 slide：
      1. 生成 slides/NN.html
      2. 读 audio/NN.meta.json 获取实际时长
      3. Patchright 录屏 → slides/NN.mp4

    返回所有 mp4 路径列表（顺序与 script.slides 一致）。
    """
    results: list[Path] = []

    for slide in script.slides:
        idx_str = _slide_index_str(slide.index)
        out_html = slides_dir / f"{idx_str}.html"
        out_mp4 = slides_dir / f"{idx_str}.mp4"

        if out_mp4.exists() and not force:
            logger.info("幻灯片 %s.mp4 已存在，跳过（使用 --force 强制重新生成）", idx_str)
            results.append(out_mp4)
            continue

        # 读 audio meta 获取实际时长
        meta_path = audio_dir / f"{idx_str}.meta.json"
        duration_ms = int(slide.duration_estimate_s * 1000) if slide.duration_estimate_s > 0 else 5000
        if meta_path.exists():
            try:
                meta: dict[str, Any] = json.loads(meta_path.read_text(encoding="utf-8"))
                duration_ms = int(meta.get("duration_ms", duration_ms))
            except Exception as e:
                logger.warning("读取 audio meta 失败，使用估算时长：%s", e)

        # 生成 HTML
        generate_slide_html(slide, out_html)

        # 录屏
        webm_dir = slides_dir / "_webm"
        asyncio.run(_record_slide(out_html, out_mp4, duration_ms, webm_dir))
        results.append(out_mp4)

    # 清理临时 webm 目录
    webm_dir = slides_dir / "_webm"
    if webm_dir.exists():
        try:
            import shutil
            shutil.rmtree(webm_dir)
        except Exception as e:
            logger.warning("清理 webm 临时目录失败：%s", e)

    return results
