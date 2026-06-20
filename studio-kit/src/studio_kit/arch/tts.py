"""arch 讲解逐段语音合成：复用 IndexTTS-2 / placeholder，产 audio/NN.wav + NN.meta.json。"""
from __future__ import annotations

from pathlib import Path

from studio_kit.core.audio import write_audio_meta
from studio_kit.core.contracts import ArchDoc
from studio_kit.core.logging import get_logger

logger = get_logger(__name__)


def _idx(i: int) -> str:
    return f"{i:02d}"


def run_arch_tts(
    doc: ArchDoc,
    audio_dir: Path,
    *,
    backend: str,
    voice_sample: Path | None,
    force: bool,
) -> None:
    """逐段合成语音。backend：'indextts'（GPU 音色克隆）或 'placeholder'（静音，测试用）。"""
    audio_dir.mkdir(parents=True, exist_ok=True)

    if backend == "placeholder":
        from studio_kit.tts import placeholder as be

        for seg in doc.segments:
            idx = _idx(seg.index)
            wav = audio_dir / f"{idx}.wav"
            meta = audio_dir / f"{idx}.meta.json"
            if wav.exists() and meta.exists() and not force:
                continue
            dur = be.synthesize(seg.narration, wav, voice_sample)
            write_audio_meta(meta, seg.index, dur, len(seg.narration), backend)
            logger.debug("TTS[%s] %.1fs → %s", idx, dur, wav)

    elif backend == "indextts":
        from studio_kit.tts.indextts import run_batch

        pending: list[dict] = []
        for seg in doc.segments:
            idx = _idx(seg.index)
            wav = audio_dir / f"{idx}.wav"
            meta = audio_dir / f"{idx}.meta.json"
            if wav.exists() and meta.exists() and not force:
                continue
            pending.append({"index": seg.index, "text": seg.narration, "output": str(wav)})
        if not pending:
            logger.info("audio/ 已完整，跳过 indextts")
            return
        logger.info("IndexTTS-2 批量合成 %d 段…", len(pending))
        durations = run_batch(pending, voice_sample)
        by_index = {s.index: s for s in doc.segments}
        for task, dur in zip(pending, durations):
            i = task["index"]
            write_audio_meta(
                audio_dir / f"{_idx(i)}.meta.json",
                i,
                dur,
                len(by_index[i].narration),
                backend,
            )

    else:
        raise ValueError(f"未知 TTS 后端：{backend}（支持 placeholder, indextts）")
