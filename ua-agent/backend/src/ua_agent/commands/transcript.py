from __future__ import annotations

import logging
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Annotated, Any

import typer

from ua_agent.contracts.transcript import (
    TranscriptError,
    TranscriptProgress,
    TranscriptResult,
)
from ua_agent.library.paths import asr_model_dir

logger = logging.getLogger(__name__)

# Path to the vendored Fun-ASR Python sources (model.py + ctc.py + tools/).
# These are mirrored verbatim from https://github.com/FunAudioLLM/Fun-ASR
# because the model.py defines the FunASRNano architecture class which
# funasr's built-in registry doesn't ship. See backend/vendor/funasr_nano/.
_VENDOR_DIR = Path(__file__).resolve().parents[3] / "vendor" / "funasr_nano"
_VENDOR_MODEL_PY = _VENDOR_DIR / "model.py"

transcript_app = typer.Typer(no_args_is_help=True, add_completion=False)

# Heuristic: Fun-ASR-Nano model.pt is ~2.13 GB. Anything smaller than 1 GB is
# almost certainly a partial / corrupted download.
_MIN_MODEL_BYTES = 1 * 1024 * 1024 * 1024  # 1 GB


def _emit(payload: TranscriptProgress | TranscriptResult | TranscriptError) -> None:
    typer.echo(payload.model_dump_json())


def _extract_first_text(result: object) -> str:
    """Pull the `text` field out of funasr's heterogeneous result shape
    (sometimes a list of dicts, sometimes a single dict). Returns "" on miss."""
    if isinstance(result, list) and len(result) > 0:
        first = result[0]
        if isinstance(first, dict):
            raw = first.get("text", "")
            if isinstance(raw, str):
                return raw.strip()
    elif isinstance(result, dict):
        raw = result.get("text", "")
        if isinstance(raw, str):
            return raw.strip()
    return ""


def _model_installed(model_dir: Path) -> bool:
    bin_path = model_dir / "model.pt"
    if not bin_path.exists():
        return False
    try:
        return bin_path.stat().st_size >= _MIN_MODEL_BYTES
    except OSError:
        return False


def _detect_device() -> str:
    try:
        import torch  # type: ignore[import-not-found]

        return "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:  # noqa: BLE001
        return "cpu"


def _cuda_supports_bf16() -> bool:
    try:
        import torch  # type: ignore[import-not-found]

        return bool(torch.cuda.is_available() and torch.cuda.is_bf16_supported())
    except Exception:  # noqa: BLE001
        return False


def _audio_duration_seconds(media_path: Path) -> float:
    """Best-effort duration probe via torchaudio. Returns 0.0 if unknown."""
    try:
        import torchaudio  # type: ignore[import-not-found]

        info = torchaudio.info(str(media_path))
        if info.num_frames > 0 and info.sample_rate > 0:
            return float(info.num_frames) / float(info.sample_rate)
    except Exception:  # noqa: BLE001
        pass
    return 0.0


def _run(*, post_id: str, media_path: Path) -> None:
    del post_id  # accepted for log context; output schema does not echo it.
    model_dir = asr_model_dir()
    if not _model_installed(model_dir):
        _emit(
            TranscriptError(
                code="ASR_MODEL_MISSING",
                message=f"Fun-ASR 模型未安装：{model_dir}",
            )
        )
        return
    if not media_path.exists():
        _emit(
            TranscriptError(
                code="TRANSCRIPT_DECODE_FAILED",
                message=f"media file not found: {media_path}",
            )
        )
        return

    _emit(TranscriptProgress(stage="loading_model", percent=0.0))

    try:
        # Imported lazily so `--help` and the model-missing path don't pay the
        # ~5–10 s torch + funasr import cost.
        from funasr import AutoModel  # type: ignore[import-not-found]
    except Exception as exc:  # noqa: BLE001
        _emit(
            TranscriptError(
                code="INTERNAL",
                message=f"failed to import funasr: {exc}",
            )
        )
        return

    device = _detect_device()
    use_llm_bf16 = device == "cuda" and _cuda_supports_bf16()
    # Vendored model.py defines `@tables.register("model_classes", "FunASRNano")`
    # at import time. We add the vendor dir to sys.path AND import the module
    # explicitly here, so funasr's class registry knows about FunASRNano before
    # AutoModel tries to look it up. (funasr's `remote_code=` mechanism doesn't
    # handle Windows absolute paths reliably — direct import is more robust.)
    if not _VENDOR_MODEL_PY.exists():
        _emit(
            TranscriptError(
                code="INTERNAL",
                message=f"vendored funasr_nano/model.py missing at {_VENDOR_MODEL_PY}",
            )
        )
        return
    if str(_VENDOR_DIR) not in sys.path:
        sys.path.insert(0, str(_VENDOR_DIR))
    try:
        import model as _funasr_nano_model  # noqa: F401  (side-effect: registers FunASRNano)
    except Exception as exc:  # noqa: BLE001
        logger.exception("vendored model.py import failed")
        _emit(
            TranscriptError(
                code="INTERNAL",
                message=f"vendored model.py import failed: {exc}",
            )
        )
        return
    try:
        # NOTE: funasr's built-in VAD wrapper (vad_model="fsmn-vad") is
        # currently incompatible with Fun-ASR-Nano because the model does not
        # yet emit per-segment timestamps (README's own TODO list). The wrapper
        # crashes with `KeyError: 0` in inference_with_vad when stitching.
        # We do our own time-based chunking below in _transcribe_chunked()
        # to keep each generate() call ≤30 s and avoid degenerate repetition.
        model = AutoModel(
            model=str(model_dir),
            trust_remote_code=True,
            disable_update=True,  # don't try to phone home to ModelScope
            device=device,
            # Fun-ASR-Nano's audio encoder / CTC path still expects float32 on
            # this runtime. Keep those layers in fp32, while running the Qwen
            # LLM decoder in bf16 on CUDA; the model config is tuned for bf16,
            # while fp16 can degenerate into repeated punctuation.
            fp16=False,
            bf16=False,
            llm_dtype="bf16" if use_llm_bf16 else "fp32",
            llm_conf={"llm_dtype": "bf16" if use_llm_bf16 else "fp32"},
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("AutoModel load failed")
        _emit(
            TranscriptError(
                code="INTERNAL",
                message=f"AutoModel load failed: {exc}",
            )
        )
        return

    _emit(TranscriptProgress(stage="loading_model", percent=100.0))
    _emit(TranscriptProgress(stage="transcribing", percent=0.0))

    # Load + resample to 16 kHz mono via librosa (transitive dep of funasr).
    # Doing it once here gives us authoritative duration AND lets us slice
    # without re-decoding per chunk.
    try:
        import librosa  # type: ignore[import-not-found]
        import numpy as np  # type: ignore[import-not-found]
    except Exception as exc:  # noqa: BLE001
        _emit(
            TranscriptError(
                code="INTERNAL",
                message=f"failed to import librosa/numpy: {exc}",
            )
        )
        return

    try:
        waveform, sr = librosa.load(str(media_path), sr=16000, mono=True)
    except Exception as exc:  # noqa: BLE001
        logger.exception("librosa.load failed")
        _emit(
            TranscriptError(
                code="TRANSCRIPT_DECODE_FAILED",
                message=f"audio decode failed: {exc}",
            )
        )
        return

    duration = float(len(waveform)) / float(sr) if sr > 0 else 0.0
    if duration <= 0.0 or waveform.size == 0:
        _emit(
            TranscriptError(
                code="TRANSCRIPT_NO_AUDIO",
                message="no audio track or zero-duration media",
            )
        )
        return

    # Chunking: keep each call to ≤25 s (well under model's 30 s comfort zone)
    # with 1 s overlap to avoid clipping word boundaries. For ≤30 s audio we
    # transcribe in one shot.
    chunk_seconds = 25.0
    overlap_seconds = 1.0
    chunk_samples = int(chunk_seconds * sr)
    overlap_samples = int(overlap_seconds * sr)
    step = chunk_samples - overlap_samples

    if duration <= 30.0:
        chunks: list[np.ndarray] = [waveform]
    else:
        chunks = []
        for start in range(0, len(waveform), step):
            chunk = waveform[start : start + chunk_samples]
            # Drop sub-half-second tail that's just leftover from overlap math.
            if len(chunk) >= int(0.5 * sr):
                chunks.append(chunk)

    # funasr's model.generate for Fun-ASR-Nano only accepts file paths (passing
    # raw np arrays trips an internal NoneType iteration). Write each chunk to
    # a temp 16-kHz mono WAV and pass the path.
    try:
        import soundfile as sf  # type: ignore[import-not-found]
    except Exception as exc:  # noqa: BLE001
        _emit(
            TranscriptError(
                code="INTERNAL",
                message=f"failed to import soundfile: {exc}",
            )
        )
        return

    tmp_root = Path(tempfile.gettempdir()) / "ua-agent-transcript-chunks"
    tmp_root.mkdir(parents=True, exist_ok=True)
    chunk_paths: list[Path] = []
    parts: list[str] = []
    n = len(chunks)
    try:
        for i, chunk in enumerate(chunks):
            chunk_path = tmp_root / f"{uuid.uuid4().hex}.wav"
            sf.write(str(chunk_path), chunk, sr, subtype="PCM_16")
            chunk_paths.append(chunk_path)
            sub = model.generate(
                input=[str(chunk_path)],
                cache={},
                batch_size=1,
                language="中文",
                itn=True,
            )
            piece = _extract_first_text(sub)
            if piece:
                parts.append(piece)
            # Per-chunk progress: linearly scale 0..100 over chunks done.
            pct = ((i + 1) / n) * 100.0 if n > 0 else 100.0
            _emit(TranscriptProgress(stage="transcribing", percent=pct))
    except Exception as exc:  # noqa: BLE001
        logger.exception("model.generate (chunk) failed")
        _emit(
            TranscriptError(
                code="TRANSCRIPT_DECODE_FAILED",
                message=f"transcribe failed: {exc}",
            )
        )
        return
    finally:
        for p in chunk_paths:
            try:
                p.unlink()
            except OSError:
                pass

    text = "".join(parts).strip()

    if len(text) == 0:
        _emit(
            TranscriptError(
                code="TRANSCRIPT_NO_AUDIO",
                message="转写结果为空（可能视频无人声或音轨缺失）",
            )
        )
        return

    _emit(TranscriptProgress(stage="transcribing", percent=100.0))
    _emit(
        TranscriptResult(
            text=text,
            language="zh",
            duration_s=duration,
        )
    )


@transcript_app.command("run")
def run_cmd(
    post_id: Annotated[
        str,
        typer.Option("--post-id", help="post_id of the material being transcribed."),
    ] = "",
    media_path: Annotated[
        str,
        typer.Option("--media-path", help="absolute path to a local mp4/audio file."),
    ] = "",
    json: Annotated[
        bool,
        typer.Option("--json", help="Emit JSON-line progress + result on stdout."),
    ] = True,
) -> None:
    """Transcribe Chinese-audio media with Fun-ASR-Nano-2512 (funasr)."""
    del json  # always JSON-line; flag accepted for parity with other commands.
    if not post_id:
        _emit(TranscriptError(code="INTERNAL", message="--post-id is required"))
        return
    if not media_path:
        _emit(TranscriptError(code="INTERNAL", message="--media-path is required"))
        return
    try:
        _run(post_id=post_id, media_path=Path(media_path))
    except Exception as exc:  # noqa: BLE001
        logger.exception("transcript run crashed")
        _emit(TranscriptError(code="INTERNAL", message=str(exc) or "internal error"))


__all__: list[Any] = ["transcript_app", "run_cmd"]
