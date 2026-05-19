"""ffmpeg 抽帧 + 音频提取。

每条作品抽 N 张关键帧（默认 4 张，等时间间隔），用于 LLM 视觉分析。
同时提取 16kHz 单声道 WAV 给 Whisper 转录用。
"""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from research_kit.core.logging import get_logger

_log = get_logger(__name__)


def ensure_ffmpeg() -> str:
    """检查 ffmpeg 可执行。返回 ffmpeg 路径，找不到时抛 RuntimeError。"""
    path = shutil.which("ffmpeg")
    if path is None:
        raise RuntimeError(
            "未在 PATH 中找到 ffmpeg。请安装：\n"
            "  - Windows: winget install Gyan.FFmpeg / scoop install ffmpeg\n"
            "  - macOS: brew install ffmpeg\n"
            "  - Linux: apt install ffmpeg / yum install ffmpeg"
        )
    return path


def probe_duration_seconds(video_path: Path) -> float:
    """用 ffprobe 拿视频时长（秒）。失败返回 0。"""
    ffprobe = shutil.which("ffprobe")
    if ffprobe is None:
        return 0.0
    try:
        result = subprocess.run(
            [
                ffprobe,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(video_path),
            ],
            capture_output=True,
            text=True,
            timeout=30,
            check=True,
        )
        return float(result.stdout.strip())
    except Exception as exc:  # pragma: no cover
        _log.warning("ffprobe duration 解析失败 %s: %s", video_path, exc)
        return 0.0


def extract_key_frames(
    video_path: Path,
    output_dir: Path,
    *,
    frame_count: int = 4,
) -> list[Path]:
    """按等时间间隔抽 N 帧。命名 `1.jpg ~ N.jpg`（与 ua-agent 一致）。"""
    ffmpeg = ensure_ffmpeg()
    output_dir.mkdir(parents=True, exist_ok=True)

    duration = probe_duration_seconds(video_path)
    if duration <= 0:
        _log.warning("视频时长未知，退化为只抽 1 帧（开头）: %s", video_path)
        duration = 0.0

    # 抽 N 帧的时间点：把视频分成 (N+1) 段，取中间 N 个分割点
    timestamps: list[float] = []
    for i in range(frame_count):
        ts = duration * (i + 1) / (frame_count + 1) if duration > 0 else 0.5
        timestamps.append(max(0.0, ts))

    out_paths: list[Path] = []
    for idx, ts in enumerate(timestamps, start=1):
        out = output_dir / f"{idx}.jpg"
        cmd = [
            ffmpeg,
            "-y",
            "-ss",
            f"{ts:.2f}",
            "-i",
            str(video_path),
            "-vframes",
            "1",
            "-q:v",
            "3",
            str(out),
        ]
        try:
            subprocess.run(cmd, capture_output=True, timeout=60, check=True)
            if out.exists() and out.stat().st_size > 0:
                out_paths.append(out)
        except Exception as exc:  # pragma: no cover
            _log.warning("抽帧 #%d 失败 %s: %s", idx, video_path, exc)

    return out_paths


def extract_audio(video_path: Path, output_path: Path) -> Path:
    """提取 16kHz 单声道 WAV，供 Whisper 转录。"""
    ffmpeg = ensure_ffmpeg()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(video_path),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        str(output_path),
    ]
    try:
        subprocess.run(cmd, capture_output=True, timeout=120, check=True)
    except Exception as exc:
        raise RuntimeError(f"提取音频失败 {video_path}: {exc}") from exc
    if not output_path.exists() or output_path.stat().st_size == 0:
        raise RuntimeError(f"音频提取完成但文件为空：{output_path}")
    return output_path


__all__ = [
    "ensure_ffmpeg",
    "extract_audio",
    "extract_key_frames",
    "probe_duration_seconds",
]
