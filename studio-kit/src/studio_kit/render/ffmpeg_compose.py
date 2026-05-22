"""用 ffmpeg 把幻灯片 mp4 + 音频 WAV 合成 final.mp4。

流程（MVP，无 xfade 转场）：
  1. 每个 slide：视频 + 音频 → slide_av/NN.mp4（含音轨）
  2. 生成 concat.txt，用 concat demuxer 拼接所有 slide_av/NN.mp4
  3. 生成 subtitles.srt（从 narration 按时间轴累加）
  4. ffmpeg concat + 烧入字幕 → final.mp4 (1080×1920, 30fps, h264, aac 192k)
"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

import ffmpeg

from studio_kit.core.contracts import ScriptDoc, SlideItem
from studio_kit.core.logging import get_logger

logger = get_logger(__name__)


def _slide_index_str(index: int) -> str:
    return f"{index:02d}"


def _seconds_to_srt_time(total_seconds: float) -> str:
    """把秒数转换为 SRT 时间格式 HH:MM:SS,mmm。"""
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    secs = int(total_seconds % 60)
    millis = int((total_seconds - int(total_seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def _generate_srt(
    script: ScriptDoc,
    audio_dir: Path,
    out_srt: Path,
) -> None:
    """生成 SRT 字幕文件，时间轴根据各段 audio meta.json 中的 duration_ms 累加。"""
    entries: list[str] = []
    current_s: float = 0.0

    for slide in script.slides:
        idx_str = _slide_index_str(slide.index)
        meta_path = audio_dir / f"{idx_str}.meta.json"

        # 获取本段时长
        duration_s = slide.duration_estimate_s if slide.duration_estimate_s > 0 else 3.0
        if meta_path.exists():
            try:
                meta: dict[str, Any] = json.loads(meta_path.read_text(encoding="utf-8"))
                duration_s = meta.get("duration_ms", duration_s * 1000) / 1000.0
            except Exception as e:
                logger.warning("读取 audio meta 失败，使用估算时长：%s", e)

        start_time = _seconds_to_srt_time(current_s)
        end_time = _seconds_to_srt_time(current_s + duration_s)

        # 每条字幕显示 narration（长文本分行，每行最多 20 字）
        narration = slide.narration.strip()
        # 按 20 字切分成多行
        lines: list[str] = []
        while len(narration) > 20:
            lines.append(narration[:20])
            narration = narration[20:]
        if narration:
            lines.append(narration)
        subtitle_text = "\n".join(lines)

        entries.append(
            f"{slide.index + 1}\n{start_time} --> {end_time}\n{subtitle_text}\n"
        )
        current_s += duration_s

    out_srt.parent.mkdir(parents=True, exist_ok=True)
    out_srt.write_text("\n".join(entries), encoding="utf-8")
    logger.info("SRT 字幕已生成：%s", out_srt)


def _merge_slide_av(
    slide_mp4: Path,
    audio_wav: Path,
    out_av_mp4: Path,
) -> None:
    """把无音轨的幻灯片 mp4 与对应 WAV 合并成含音轨的 mp4。"""
    v_in = ffmpeg.input(str(slide_mp4))
    a_in = ffmpeg.input(str(audio_wav))
    (
        ffmpeg
        .output(
            v_in,
            a_in,
            str(out_av_mp4),
            vcodec="copy",
            acodec="aac",
            **{"b:a": "192k"},
        )
        .overwrite_output()
        .run(quiet=True)
    )
    logger.debug("合并音轨：%s", out_av_mp4)


def _write_concat_txt(av_mp4_paths: list[Path], out_txt: Path) -> None:
    """写 ffmpeg concat demuxer 格式的文件列表。"""
    lines = [f"file '{p.as_posix()}'" for p in av_mp4_paths]
    out_txt.parent.mkdir(parents=True, exist_ok=True)
    out_txt.write_text("\n".join(lines), encoding="utf-8")
    logger.debug("concat.txt 已写出：%s", out_txt)


def compose(
    script: ScriptDoc,
    audio_dir: Path,
    slides_dir: Path,
    out_mp4: Path,
    *,
    force: bool = False,
) -> None:
    """
    合成 final.mp4。

    参数：
      script     : 已解析的 ScriptDoc
      audio_dir  : 含 NN.wav + NN.meta.json 的目录
      slides_dir : 含 NN.mp4（无音轨）的目录
      out_mp4    : 输出路径
      force      : True 时覆盖已有 final.mp4
    """
    if out_mp4.exists() and not force:
        logger.info("final.mp4 已存在，跳过（使用 --force 强制重新生成）")
        return

    work_dir = out_mp4.parent
    slide_av_dir = work_dir / "slide_av"
    slide_av_dir.mkdir(parents=True, exist_ok=True)

    av_paths: list[Path] = []

    # 步骤 1：逐片段合并音轨
    for slide in script.slides:
        idx_str = _slide_index_str(slide.index)
        slide_mp4 = slides_dir / f"{idx_str}.mp4"
        audio_wav = audio_dir / f"{idx_str}.wav"
        out_av = slide_av_dir / f"{idx_str}.mp4"

        if not slide_mp4.exists():
            raise FileNotFoundError(f"幻灯片视频不存在：{slide_mp4}")
        if not audio_wav.exists():
            raise FileNotFoundError(f"音频文件不存在：{audio_wav}")

        _merge_slide_av(slide_mp4, audio_wav, out_av)
        av_paths.append(out_av)

    if not av_paths:
        raise ValueError("没有可合成的幻灯片，检查 slides_dir 和 audio_dir")

    # 步骤 2：写 concat.txt
    concat_txt = work_dir / "concat.txt"
    _write_concat_txt(av_paths, concat_txt)

    # 步骤 3：生成 SRT 字幕
    srt_path = work_dir / "subtitles.srt"
    _generate_srt(script, audio_dir, srt_path)

    # 步骤 4：concat + 烧入字幕 → final.mp4
    # 用 subprocess 调 ffmpeg 以便精确控制 filter_complex（ffmpeg-python 的字幕滤镜有路径转义问题）
    _concat_with_subtitles(concat_txt, srt_path, out_mp4)

    logger.info("final.mp4 合成完成：%s", out_mp4)


def _concat_with_subtitles(
    concat_txt: Path,
    srt_path: Path,
    out_mp4: Path,
) -> None:
    """用 subprocess 调 ffmpeg 完成 concat + 字幕烧入。"""
    # Windows 路径分隔符问题：subtitles 滤镜需要转义冒号
    # 用 srt_path.as_posix() 并替换冒号
    srt_posix = srt_path.as_posix().replace(":", "\\:")

    cmd: list[str] = [
        "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_txt),
        "-vf", f"subtitles='{srt_posix}':force_style='FontSize=30,PrimaryColour=&HFFFFFF,Alignment=2'",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        str(out_mp4),
    ]

    logger.debug("执行 ffmpeg concat 命令：%s", " ".join(cmd))

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    if result.returncode != 0:
        # 写 compose.log 并 raise
        log_path = out_mp4.parent / "compose.log"
        log_path.write_text(
            f"STDOUT:\n{result.stdout}\n\nSTDERR:\n{result.stderr}",
            encoding="utf-8",
        )
        raise RuntimeError(
            f"ffmpeg 合成失败（返回码 {result.returncode}）。"
            f"详细日志：{log_path}"
        )
