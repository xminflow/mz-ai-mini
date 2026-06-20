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

from studio_kit.core.contracts import ArchVideoDoc, ScriptDoc, SlideItem
from studio_kit.core.logging import get_logger
from studio_kit.render.video_format import HORIZONTAL, VideoFormat, VERTICAL

logger = get_logger(__name__)


def _slide_index_str(index: int) -> str:
    return f"{index:02d}"



def _seconds_to_ass_time(total_seconds: float) -> str:
    """把秒数转换为 ASS 时间格式 H:MM:SS.xx（百分之秒）。"""
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    secs = int(total_seconds % 60)
    centis = int((total_seconds - int(total_seconds)) * 100)
    return f"{hours}:{minutes:02d}:{secs:02d}.{centis:02d}"


import re as _re

# 强标点：句子边界（一句话结束）
_PRIMARY_PUNCT_RE = _re.compile(r'[。！？.!?]+')
# 次标点：子句边界（仅在强标点切出的块仍超长时再切）
_SECONDARY_PUNCT_RE = _re.compile(r'[，,；;、——–]+')
# 残留首尾标点清理
_TRIM_PUNCT = '，,。.；;、——–·-：:""\'\'（）()【】《》…'


def _chunk_narration(narration: str, max_chars: int = 12) -> list[str]:
    """按标点把旁白切成完整子句，每条不超过 max_chars 字。

    切分优先级（保证语义完整）：
      1. 按强标点（。！？）切句子。每句完整。
      2. 若句子长度 > max_chars，再按次标点（，；、——）切子句。
      3. 极端情况（子句仍超长）才按字数硬切作 fallback。

    80px 字号下每个中文字约 80px 宽，12 字 × 80px = 960px < 1080px 视口宽。
    """
    text = narration.strip()
    if not text:
        return []

    chunks: list[str] = []
    # 第 1 层：按强标点切句子
    sentences = [s for s in _PRIMARY_PUNCT_RE.split(text) if s.strip()]
    for sent in sentences:
        sent = sent.strip(_TRIM_PUNCT).strip()
        if not sent:
            continue
        if len(sent) <= max_chars:
            chunks.append(sent)
            continue
        # 第 2 层：按次标点切子句
        subclauses = [s for s in _SECONDARY_PUNCT_RE.split(sent) if s.strip()]
        for sub in subclauses:
            sub = sub.strip(_TRIM_PUNCT).strip()
            if not sub:
                continue
            if len(sub) <= max_chars:
                chunks.append(sub)
                continue
            # 第 3 层 fallback：均匀硬切，避免产生 ≤3 字短尾
            n = len(sub)
            pieces = (n + max_chars - 1) // max_chars  # 估算切几片
            per = (n + pieces - 1) // pieces            # 每片大致字数
            i = 0
            while i < n:
                end = min(i + per, n)
                chunks.append(sub[i:end])
                i = end

    # 短碎片合并：≤3 字的碎片（如"一"、"二"等序号）合并到下一段
    merged: list[str] = []
    for c in chunks:
        if merged and len(merged[-1]) <= 3:
            joined = merged[-1] + " " + c
            if len(joined) <= max_chars:
                merged[-1] = joined
                continue
        merged.append(c)
    # 末段太短时回合并到前段（宽容 4 字，避免"定位"这种孤儿尾巴）
    if len(merged) >= 2 and len(merged[-1]) <= 3:
        joined = merged[-2] + " " + merged[-1]
        if len(joined) <= max_chars + 4:
            merged[-2] = joined
            merged.pop()
    return merged


def _generate_ass(
    segments: list[tuple[int, str]],
    audio_dir: Path,
    out_ass: Path,
    fmt: VideoFormat = VERTICAL,
) -> None:
    """生成 ASS 字幕文件，按 VideoFormat 参数化分辨率与字号。

    segments: [(index, narration), ...] 顺序列表。
    竖屏默认值（fmt=VERTICAL）保持与历史行为完全一致：PlayRes 1080×1920，字号 80，MarginV 480。
    """
    header = (
        "[Script Info]\n"
        "ScriptType: v4.00+\n"
        f"PlayResX: {fmt.width}\n"
        f"PlayResY: {fmt.height}\n"
        "ScaledBorderAndShadow: yes\n"
        "WrapStyle: 1\n"
        "\n"
        "[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
        "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, "
        "ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
        "Alignment, MarginL, MarginR, MarginV, Encoding\n"
        f"Style: Default,Microsoft YaHei,{fmt.sub_fontsize},"
        "&H00FFFFFF,&H000000FF,&H00000000,&H00000000,"
        f"-1,0,0,0,100,100,0,0,1,3,0,2,40,40,{fmt.sub_margin_v},1\n"
        "\n"
        "[Events]\n"
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    )

    dialogue_lines: list[str] = []
    current_s: float = 0.0

    for index, narration in segments:
        idx_str = _slide_index_str(index)
        meta_path = audio_dir / f"{idx_str}.meta.json"

        # 无 meta 文件时默认 3 秒（与竖屏原逻辑一致）
        duration_s = 3.0
        if meta_path.exists():
            try:
                meta: dict[str, Any] = json.loads(meta_path.read_text(encoding="utf-8"))
                duration_s = meta.get("duration_ms", duration_s * 1000) / 1000.0
            except Exception as e:
                logger.warning("读取 audio meta 失败，使用默认时长：%s", e)

        chunks = _chunk_narration(narration)
        if not chunks:
            current_s += duration_s
            continue

        # 每个短句均分当前段时长
        chunk_dur = duration_s / len(chunks)
        for i, chunk in enumerate(chunks):
            t_start = current_s + i * chunk_dur
            t_end = t_start + chunk_dur
            dialogue_lines.append(
                f"Dialogue: 0,{_seconds_to_ass_time(t_start)},{_seconds_to_ass_time(t_end)},"
                f"Default,,0,0,0,,{chunk}"
            )

        current_s += duration_s

    out_ass.parent.mkdir(parents=True, exist_ok=True)
    out_ass.write_text(header + "\n".join(dialogue_lines) + "\n", encoding="utf-8")
    logger.info("ASS 字幕已生成：%s", out_ass)


def _merge_slide_av(
    slide_mp4: Path,
    audio_wav: Path,
    out_av_mp4: Path,
) -> None:
    """把无音轨的幻灯片 mp4 与对应 WAV 合并成含音轨的 mp4。

    录屏比音频多 300ms 缓冲，-shortest 确保视频截到与音频等长，消除末帧冻结导致的音画漂移。
    """
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
            shortest=None,  # 截到较短流（音频），避免尾帧冻结
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

    # 步骤 3：生成 ASS 字幕（竖屏 1080×1920，由 VERTICAL 常量保证字号/边距不变）
    ass_path = work_dir / "subtitles.ass"
    segments = [(s.index, s.narration) for s in script.slides]
    _generate_ass(segments, audio_dir, ass_path, VERTICAL)

    # 步骤 4：concat + 烧入字幕 → final.mp4
    _concat_with_subtitles(concat_txt, ass_path, out_mp4)

    logger.info("final.mp4 合成完成：%s", out_mp4)


def _concat_with_subtitles(
    concat_txt: Path,
    ass_path: Path,
    out_mp4: Path,
) -> None:
    """用 subprocess 调 ffmpeg 完成 concat + ASS 字幕烧入。"""
    # Windows 路径分隔符：subtitles 滤镜需把盘符冒号转义为 \:
    ass_posix = ass_path.as_posix().replace(":", "\\:")

    cmd: list[str] = [
        "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_txt),
        "-vf", f"ass='{ass_posix}'",
        "-af", "asetpts=PTS-STARTPTS",  # 拼接后重置音频 PTS，消除时间戳累积漂移
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


def compose_arch(
    doc: ArchVideoDoc,
    audio_dir: Path,
    clips_dir: Path,
    out_mp4: Path,
    *,
    force: bool = False,
) -> None:
    """把 clips/NN.mp4（无音轨）+ audio/NN.wav 合成横版 final.mp4（1920×1080）。

    复用竖屏同款 helper：逐段合并音轨 → concat → 烧 ASS 字幕。
    缺片段视频或音频时显式 raise FileNotFoundError，不静默兜底。
    """
    if out_mp4.exists() and not force:
        logger.info("final.mp4 已存在，跳过（--force 强制重生）")
        return

    work_dir = out_mp4.parent
    clip_av_dir = work_dir / "clip_av"
    clip_av_dir.mkdir(parents=True, exist_ok=True)

    av_paths: list[Path] = []

    # 逐段合并音轨
    for seg in doc.segments:
        idx_str = _slide_index_str(seg.index)
        clip_mp4 = clips_dir / f"{idx_str}.mp4"
        audio_wav = audio_dir / f"{idx_str}.wav"

        if not clip_mp4.exists():
            raise FileNotFoundError(f"片段视频不存在：{clip_mp4}")
        if not audio_wav.exists():
            raise FileNotFoundError(f"音频不存在：{audio_wav}")

        out_av = clip_av_dir / f"{idx_str}.mp4"
        _merge_slide_av(clip_mp4, audio_wav, out_av)
        av_paths.append(out_av)

    if not av_paths:
        raise ValueError("没有可合成的片段")

    # 写 concat.txt
    concat_txt = work_dir / "concat.txt"
    _write_concat_txt(av_paths, concat_txt)

    # 生成横版 ASS 字幕（1920×1080，字号/边距由 HORIZONTAL 驱动）
    ass_path = work_dir / "subtitles.ass"
    _generate_ass([(s.index, s.narration) for s in doc.segments], audio_dir, ass_path, HORIZONTAL)

    # concat + 烧入字幕 → final.mp4
    _concat_with_subtitles(concat_txt, ass_path, out_mp4)

    logger.info("横版 final.mp4 合成完成：%s", out_mp4)
