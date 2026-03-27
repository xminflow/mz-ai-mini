from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ..dtos import BusinessCaseDetailResult, CreateBusinessCaseCommand
from ..ports import BusinessCaseRepository, CurrentTimeProvider, SnowflakeIdGenerator
from ._common import (
    _normalize_case_id,
    build_detail_result,
    build_registration,
    resolve_published_at,
)


business_case_logger = get_logger("mz_ai_backend.business_cases")


class CreateBusinessCaseUseCase:
    """Create one business case aggregate."""

    def __init__(
        self,
        *,
        business_case_repository: BusinessCaseRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._business_case_repository = business_case_repository
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider

    async def execute(
        self,
        command: CreateBusinessCaseCommand,
    ) -> BusinessCaseDetailResult:
        now = self._current_time_provider.now()
        case_id = (
            _normalize_case_id(command.case_id)
            if command.case_id is not None
            else str(self._snowflake_id_generator.generate())
        )
        registration = build_registration(
            command,
            case_id=case_id,
            published_at=resolve_published_at(
                current_status=None,
                next_status=command.status,
                current_published_at=None,
                now=now,
            ),
            snowflake_id_generator=self._snowflake_id_generator,
        )
        case = await self._business_case_repository.create(registration)
        business_case_logger.info(
            "business_case.created case_id=%s status=%s",
            case.case_id,
            case.status.value,
        )
        return build_detail_result(case)
