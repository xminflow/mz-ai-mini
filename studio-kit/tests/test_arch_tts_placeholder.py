import json
from pathlib import Path
from studio_kit.core.contracts import ArchDoc
from studio_kit.arch.tts import run_arch_tts


def _doc() -> ArchDoc:
    return ArchDoc.model_validate({
        "slug": "im", "run_id": "r1", "title": "T",
        "diagram": {"layers": [
            {"id": "a", "title": "A层", "accent": "#4DA3FF",
             "nodes": [{"id": "a.x", "title": "X"}]}]},
        "segments": [
            {"index": 0, "narration": "第一段讲解", "highlight": "all"},
            {"index": 1, "narration": "第二段讲解", "highlight": "a"},
        ],
    })


def test_placeholder_tts_writes_wav_and_meta(tmp_path: Path) -> None:
    audio_dir = tmp_path / "audio"
    run_arch_tts(_doc(), audio_dir, backend="placeholder", voice_sample=None, force=False)
    for i in ("00", "01"):
        assert (audio_dir / f"{i}.wav").exists()
        meta = json.loads((audio_dir / f"{i}.meta.json").read_text(encoding="utf-8"))
        assert meta["duration_ms"] > 0
        assert meta["backend"] == "placeholder"


def test_unknown_backend_raises(tmp_path: Path) -> None:
    import pytest
    with pytest.raises(ValueError):
        run_arch_tts(_doc(), tmp_path / "a", backend="bogus", voice_sample=None, force=False)
