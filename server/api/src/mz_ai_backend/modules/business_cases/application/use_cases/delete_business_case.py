from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import BusinessCaseNotFoundException
from ..dtos import DeleteBusinessCaseCommand, DeleteBusinessCaseResult
from ..ports import BusinessCaseRepository


business_case_logger = get_logger("mz_ai_backend.business_cases")


class DeleteBusinessCaseUseCase:
    """Logically delete one business case aggregate."""

    def __init__(self, *, business_case_repository: BusinessCaseRepository) -> None:
        self._business_case_repository = business_case_repository

    async def execute(
        self,
        command: DeleteBusinessCaseCommand,
    ) -> DeleteBusinessCaseResult:
        deleted = await self._business_case_repository.delete(command.case_id)
        if not deleted:
            raise BusinessCaseNotFoundException(case_id=command.case_id)

        business_case_logger.info("business_case.deleted case_id=%s", command.case_id)
        return DeleteBusinessCaseResult(case_id=command.case_id)
