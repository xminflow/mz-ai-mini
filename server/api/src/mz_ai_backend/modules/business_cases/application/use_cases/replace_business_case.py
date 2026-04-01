from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import BusinessCaseNotFoundException
from ..dtos import BusinessCaseDetailResult, ReplaceBusinessCaseCommand
from ..ports import (
    BusinessCaseRepository,
    CurrentTimeProvider,
    SnowflakeIdGenerator,
)
from ._common import build_detail_result, build_replacement, resolve_published_at


business_case_logger = get_logger("mz_ai_backend.business_cases")


class ReplaceBusinessCaseUseCase:
    """Fully replace one business case aggregate."""

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
        command: ReplaceBusinessCaseCommand,
    ) -> BusinessCaseDetailResult:
        existing_case = await self._business_case_repository.get_by_case_id(command.case_id)
        if existing_case is None:
            raise BusinessCaseNotFoundException(case_id=command.case_id)

        replacement = build_replacement(
            command,
            current_documents=existing_case.documents,
            published_at=resolve_published_at(
                current_status=existing_case.status,
                next_status=command.status,
                current_published_at=existing_case.published_at,
                now=self._current_time_provider.now(),
            ),
            snowflake_id_generator=self._snowflake_id_generator,
        )
        case = await self._business_case_repository.replace(replacement)
        if case is None:
            raise BusinessCaseNotFoundException(case_id=command.case_id)

        business_case_logger.info(
            "business_case.replaced case_id=%s status=%s",
            case.case_id,
            case.status.value,
        )
        return build_detail_result(case)
