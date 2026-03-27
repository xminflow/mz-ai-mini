from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict

from ..application import HealthStatusResult


class HealthStatusResponse(BaseModel):
    """HTTP response payload for the health endpoint."""

    model_config = ConfigDict(frozen=True)

    service_name: str
    environment: str
    version: str
    status: Literal["ok"]

    @classmethod
    def from_result(cls, result: HealthStatusResult) -> "HealthStatusResponse":
        return cls.model_validate(result.model_dump())
