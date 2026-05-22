"""Placeholder TTS 后端：生成静音 WAV，按字数估时长。"""
from __future__ import annotations

import wave
from pathlib import Path

CHARS_PER_SEC: float = 5.5


def synthesize(text: str, output_wav: Path, voice_sample: Path | None = None) -> float:
    """按 5.5 字/秒估算时长，生成对应时长的静音 WAV，返回时长（秒）。"""
    chars = len(text.strip())
    duration_s = max(chars / CHARS_PER_SEC, 1.0)
    _write_silence_wav(output_wav, duration_s)
    return duration_s


def _write_silence_wav(path: Path, duration_s: float, sample_rate: int = 44100) -> None:
    n_samples = int(sample_rate * duration_s)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16bit
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * n_samples)
