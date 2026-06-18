from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


class ServiceHealth(BaseModel):
    """Domain entity representing current service health."""

    model_config = ConfigDict(frozen=True)

    service_name: str
    environment: str
    version: str
    status: Literal["ok"]
