from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from community_backend.core.config import Settings
from community_backend.core.dependencies import get_settings_dependency

from ..application import GetHealthStatusUseCase


def get_health_status_use_case(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> GetHealthStatusUseCase:
    """Construct the health status use case."""

    return GetHealthStatusUseCase(settings=settings)
