from __future__ import annotations

from ..dtos import ListAdminBusinessCasesQuery, ListBusinessCasesResult
from ..ports import BusinessCaseRepository
from ._common import build_list_result, decode_cursor


class ListAdminBusinessCasesUseCase:
    """Return one admin-facing business case list slice."""

    def __init__(self, *, business_case_repository: BusinessCaseRepository) -> None:
        self._business_case_repository = business_case_repository

    async def execute(
        self,
        query: ListAdminBusinessCasesQuery,
    ) -> ListBusinessCasesResult:
        page = await self._business_case_repository.list_admin(
            limit=query.limit,
            cursor=decode_cursor(query.cursor),
            status=query.status,
        )
        return build_list_result(page, sort_value_resolver=lambda item: item.created_at)
