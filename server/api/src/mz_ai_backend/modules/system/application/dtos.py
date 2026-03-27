from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


class HealthStatusResult(BaseModel):
    """Application DTO returned by the health status use case."""

    model_config = ConfigDict(frozen=True)

    service_name: str
    environment: str
    version: str
    status: Literal["ok"]
