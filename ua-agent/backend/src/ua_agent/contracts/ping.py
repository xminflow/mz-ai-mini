from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from .error import ErrorDetail, ErrorEnvelope

SCHEMA_VERSION: Literal["1"] = "1"

PingErrorDetail = ErrorDetail
PingError = ErrorEnvelope


class BackendIdentity(BaseModel):
    """Identity of the backend that produced a payload."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    name: Literal["ua-agent"] = "ua-agent"
    version: Annotated[str, Field(pattern=r"^\d+\.\d+\.\d+(?:[-+].+)?$")]
    python: Annotated[str, Field(pattern=r"^3\.(?:11|12)\..+$")]


class PingSuccess(BaseModel):
    """Successful response of the `ping` subcommand."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    schema_version: Literal["1"] = SCHEMA_VERSION
    ok: Literal[True] = True
    message: Annotated[str, Field(min_length=1, max_length=1024)]
    echo: Annotated[str | None, Field(max_length=256)]
    timestamp: Annotated[
        str,
        Field(
            description=(
                "RFC 3339 UTC, ms precision, trailing Z. "
                "Example: 2026-05-02T12:34:56.789Z."
            ),
        ),
    ]
    backend: BackendIdentity


PingResult = Annotated[
    PingSuccess | ErrorEnvelope,
    Field(discriminator="ok"),
]
