"""arch-video 串行编排：校验 → TTS → 渲染图片片段 → 合成。产物落 script.json 同级目录。"""
from __future__ import annotations

from pathlib import Path

from studio_kit.arch.tts import run_arch_tts
from studio_kit.core.contracts import ArchVideoDoc
from studio_kit.core.logging import get_logger
from studio_kit.render.image_clip import render_segment_clips
from studio_kit.render.ffmpeg_compose import compose_arch
from studio_kit.render.video_format import HORIZONTAL, ARCH_PORTRAIT

logger = get_logger(__name__)

# 默认音色样本路径（绝对路径，可被 --voice-sample 覆盖）
_DEFAULT_VOICE = Path(
    r"D:\code\weelume-base\studio-kit\assets\voice-samples\chenchangzhang-desktop.wav"
)


def run_arch_build(
    script_path: Path,
    *,
    voice_sample: Path | None,
    backend: str,
    force: bool,
    portrait: bool = False,
) -> Path:
    """串行执行 校验 → TTS → 渲染图片片段 → ffmpeg 合成，返回 final.mp4 路径。

    产物目录与 script.json 同级：
      audio/     — NN.wav + NN.meta.json
      clips/     — NN.mp4（无音轨）
      final.mp4  — 横版 1920×1080，或 portrait=True 时竖版 1080×1920

    backend='indextts' 且 voice 文件不存在时 raise FileNotFoundError（不静默兜底）。
    """
    # 竖版用 ARCH_PORTRAIT（字幕走顶部带），横版用 HORIZONTAL（字幕底部）
    fmt = ARCH_PORTRAIT if portrait else HORIZONTAL

    # 校验 ArchVideoDoc
    doc = ArchVideoDoc.model_validate_json(script_path.read_text(encoding="utf-8"))

    work_dir = script_path.parent
    audio_dir = work_dir / "audio"
    clips_dir = work_dir / "clips"
    final_mp4 = work_dir / "final.mp4"

    # 确定音色文件：命令行优先，否则回落到默认
    voice = voice_sample or (_DEFAULT_VOICE if backend == "indextts" else None)

    # indextts 后端必须确认音色样本存在，缺失立即 raise（不等到 TTS 时再失败）
    if backend == "indextts" and voice is not None and not voice.exists():
        raise FileNotFoundError(
            f"音色样本不存在：{voice}（用 --voice-sample 指定有效路径）"
        )

    logger.info("[1/3] TTS（%s）→ %s", backend, audio_dir)
    run_arch_tts(doc, audio_dir, backend=backend, voice_sample=voice, force=force)

    logger.info("[2/3] 渲染图片片段（%dx%d）→ %s", fmt.width, fmt.height, clips_dir)
    render_segment_clips(doc, audio_dir, clips_dir, work_dir, fmt=fmt, force=force)

    logger.info("[3/3] 合成 → %s", final_mp4)
    compose_arch(doc, audio_dir, clips_dir, final_mp4, fmt=fmt, force=force)

    return final_mp4
