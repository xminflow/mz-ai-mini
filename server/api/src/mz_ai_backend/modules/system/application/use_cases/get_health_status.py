from __future__ import annotations

from mz_ai_backend.core.config import Settings

from ...domain import ServiceHealth
from ..dtos import HealthStatusResult


class GetHealthStatusUseCase:
    """Return immutable service health metadata."""

    def __init__(self, *, settings: Settings) -> None:
        self._settings = settings

    def execute(self) -> HealthStatusResult:
        entity = ServiceHealth(
            service_name=self._settings.app_name,
            environment=self._settings.env,
            version=self._settings.app_version,
            status="ok",
        )
        return HealthStatusResult.model_validate(entity.model_dump())
