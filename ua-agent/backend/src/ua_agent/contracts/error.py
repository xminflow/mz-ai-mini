from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

ErrorCode = Literal[
    "INVALID_INPUT",
    "INTERNAL",
    "DEVICE_NOT_READY",
    "DOUYIN_NOT_FOREGROUND",
    "SHARE_PANEL_UNRECOGNIZED",
    "CLIPBOARD_DENIED",
    "LIBRARY_DUPLICATE",
    "LIBRARY_NOT_FOUND",
    "JIMENG_NOT_CONFIGURED",
    "JIMENG_API_FAILED",
    # 视频文案提取（Fun-ASR-Nano）
    "ASR_MODEL_MISSING",
    "TRANSCRIPT_DECODE_FAILED",
    "TRANSCRIPT_NO_AUDIO",
]


class ErrorDetail(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    code: ErrorCode
    message: Annotated[str, Field(min_length=1, max_length=1024)]


class ErrorEnvelope(BaseModel):
    """Shared error envelope across every subcommand."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    schema_version: Literal["1"] = "1"
    ok: Literal[False] = False
    error: ErrorDetail
