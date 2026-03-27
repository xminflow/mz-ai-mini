from __future__ import annotations

from ...domain import BusinessCaseNotFoundException, BusinessCaseStatus
from ..dtos import BusinessCaseDetailResult, GetBusinessCaseQuery
from ..ports import BusinessCaseRepository
from ._common import build_detail_result


class GetPublicBusinessCaseUseCase:
    """Load one published business case aggregate for the public view."""

    def __init__(self, *, business_case_repository: BusinessCaseRepository) -> None:
        self._business_case_repository = business_case_repository

    async def execute(
        self,
        query: GetBusinessCaseQuery,
    ) -> BusinessCaseDetailResult:
        case = await self._business_case_repository.get_by_case_id(query.case_id)
        if case is None or case.status != BusinessCaseStatus.PUBLISHED:
            raise BusinessCaseNotFoundException(case_id=query.case_id)
        return build_detail_result(case)
