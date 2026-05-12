from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class JimengSuccess(BaseModel):
    """Success envelope for `ua-agent jimeng generate-image`."""

    model_config = ConfigDict(extra="forbid", frozen=True)

    schema_version: Literal["1"] = "1"
    ok: Literal[True] = True
    image_path: str = Field(..., description="Absolute path of the saved PNG")
    width: int
    height: int
    elapsed_ms: int
