"""把单张 PNG 铺成定长静音 mp4 片段（1920×1080，按比例缩放 + 深色补边）。"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from studio_kit.core.contracts import ArchVideoDoc
from studio_kit.core.logging import get_logger
from studio_kit.render.video_format import VideoFormat, HORIZONTAL

logger = get_logger(__name__)


def _idx(i: int) -> str:
    return f"{i:02d}"


def build_ffmpeg_clip_cmd(
    png_path: Path, out_mp4: Path, duration_s: float,
    *, width: int = 1920, height: int = 1080, bg: str = "#12141C", fps: int = 30,
) -> list[str]:
    # 缩放到不超过目标尺寸后居中补边；setsar=1 防非方像素
    vf = (
        f"scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color={bg},setsar=1"
    )
    return [
        "ffmpeg", "-y", "-loop", "1", "-i", str(png_path),
        "-t", str(duration_s), "-vf", vf, "-r", str(fps),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", str(out_mp4),
    ]


def render_segment_clips(
    doc: ArchVideoDoc, audio_dir: Path, clips_dir: Path, work_dir: Path,
    *, fmt: VideoFormat = HORIZONTAL, force: bool = False,
) -> list[Path]:
    clips_dir.mkdir(parents=True, exist_ok=True)
    results: list[Path] = []
    for seg in doc.segments:
        idx = _idx(seg.index)
        out_mp4 = clips_dir / f"{idx}.mp4"
        if out_mp4.exists() and not force:
            logger.info("片段 %s.mp4 已存在，跳过", idx)
            results.append(out_mp4)
            continue
        png = (work_dir / seg.image).resolve()
        if not png.exists():
            raise FileNotFoundError(f"片段 {idx} 引用的 PNG 不存在：{png}")
        meta = audio_dir / f"{idx}.meta.json"
        if not meta.exists():
            raise FileNotFoundError(f"缺少 {meta}（请先运行 TTS）")
        duration_s = float(json.loads(meta.read_text(encoding="utf-8"))["duration_ms"]) / 1000.0
        cmd = build_ffmpeg_clip_cmd(png, out_mp4, duration_s, width=fmt.width, height=fmt.height)
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg 生成片段失败（{idx}）：\n{result.stderr}")
        results.append(out_mp4)
        logger.info("片段 mp4 已生成：%s", out_mp4)
    return results
