from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

TranscriptStage = Literal["loading_model", "transcribing"]


class TranscriptProgress(BaseModel):
    """Stdout JSON-line: incremental progress for the Node-side IPC handler."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    event: Literal["progress"] = "progress"
    stage: TranscriptStage
    percent: Annotated[float, Field(ge=0.0, le=100.0)]


class TranscriptResult(BaseModel):
    """Stdout JSON-line: final success result with transcript text."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    event: Literal["result"] = "result"
    text: Annotated[str, Field(max_length=65536)]
    language: Annotated[str, Field(max_length=16)]
    duration_s: Annotated[float, Field(ge=0.0)]


class TranscriptError(BaseModel):
    """Stdout JSON-line: error case. Process always exits 0; error code carries
    semantic meaning for the Node side to translate into UI text."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    event: Literal["error"] = "error"
    code: Literal[
        "ASR_MODEL_MISSING",
        "TRANSCRIPT_DECODE_FAILED",
        "TRANSCRIPT_NO_AUDIO",
        "INTERNAL",
    ]
    message: Annotated[str, Field(min_length=1, max_length=1024)]
