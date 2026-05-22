"""TTS 后端抽象协议。"""
from __future__ import annotations

from abc import abstractmethod
from pathlib import Path
from typing import Protocol


class TTSBackend(Protocol):
    """TTS 后端协议。所有实现必须满足此接口。"""

    @abstractmethod
    def synthesize(self, text: str, output_wav: Path, voice_sample: Path | None = None) -> float:
        """合成语音，返回实际时长（秒）。output_wav 必须是绝对路径。"""
        ...
