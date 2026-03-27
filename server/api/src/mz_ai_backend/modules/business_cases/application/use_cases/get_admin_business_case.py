from __future__ import annotations

from ...domain import BusinessCaseNotFoundException
from ..dtos import BusinessCaseDetailResult, GetBusinessCaseQuery
from ..ports import BusinessCaseRepository
from ._common import build_detail_result


class GetAdminBusinessCaseUseCase:
    """Load one business case aggregate for the admin view."""

    def __init__(self, *, business_case_repository: BusinessCaseRepository) -> None:
        self._business_case_repository = business_case_repository

    async def execute(
        self,
        query: GetBusinessCaseQuery,
    ) -> BusinessCaseDetailResult:
        case = await self._business_case_repository.get_by_case_id(query.case_id)
        if case is None:
            raise BusinessCaseNotFoundException(case_id=query.case_id)
        return build_detail_result(case)
