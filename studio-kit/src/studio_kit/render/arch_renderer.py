"""逐段渲染架构图片段：build_diagram_html → 录屏 → clips/NN.mp4。"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from studio_kit.core.contracts import ArchDoc
from studio_kit.core.logging import get_logger
from studio_kit.render.arch_diagram import build_diagram_html
from studio_kit.render.recorder import record_html_to_mp4
from studio_kit.render.video_format import HORIZONTAL

logger = get_logger(__name__)

# 深色背景 #12141C → RGB(18, 20, 28)
_BG: tuple[int, int, int] = (18, 20, 28)


def _idx(i: int) -> str:
    return f"{i:02d}"


def render_all_segments(
    doc: ArchDoc,
    audio_dir: Path,
    clips_dir: Path,
    *,
    force: bool = False,
) -> list[Path]:
    """逐段生成高亮 HTML 并录屏为 clips/NN.mp4。

    缺少对应 audio/NN.meta.json 时 raise FileNotFoundError，不静默兜底。
    """
    clips_dir.mkdir(parents=True, exist_ok=True)
    webm_dir = clips_dir / "_webm"
    results: list[Path] = []

    for seg in doc.segments:
        idx = _idx(seg.index)
        out_html = clips_dir / f"{idx}.html"
        out_mp4 = clips_dir / f"{idx}.mp4"

        if out_mp4.exists() and not force:
            logger.info("片段 %s.mp4 已存在，跳过（--force 重生）", idx)
            results.append(out_mp4)
            continue

        # 读 TTS 实际时长，缺少 meta 直接报错（不允许猜测时长）
        meta_path = audio_dir / f"{idx}.meta.json"
        if not meta_path.exists():
            raise FileNotFoundError(f"缺少 {meta_path}（请先运行 TTS 步骤）")

        duration_ms = int(json.loads(meta_path.read_text(encoding="utf-8"))["duration_ms"])

        # 生成当前段高亮的完整 HTML
        out_html.write_text(build_diagram_html(doc, seg.highlight), encoding="utf-8")
        logger.debug("片段 %s HTML 已写出：%s", idx, out_html)

        record_html_to_mp4(
            out_html,
            out_mp4,
            duration_ms,
            webm_dir,
            width=HORIZONTAL.width,
            height=HORIZONTAL.height,
            bg_rgb=_BG,
        )
        results.append(out_mp4)

    # 清理录屏过程中的临时 webm 目录
    if webm_dir.exists():
        try:
            shutil.rmtree(webm_dir)
        except Exception as e:
            logger.warning("清理 webm 失败：%s", e)

    return results
