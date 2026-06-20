"""音频元数据写出（NN.meta.json）。arch 与口播共享同一约定。"""
from __future__ import annotations

import json
from pathlib import Path


def write_audio_meta(meta_path: Path, index: int, duration_s: float, chars: int, backend: str) -> None:
    meta = {
        "slide_index": index,
        "duration_s": duration_s,
        "duration_ms": int(duration_s * 1000),
        "chars": chars,
        "backend": backend,
    }
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
