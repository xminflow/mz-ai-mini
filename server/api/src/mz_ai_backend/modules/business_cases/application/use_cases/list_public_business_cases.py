from __future__ import annotations

from mz_ai_backend.core.exceptions import InternalServerException

from ..dtos import ListBusinessCasesResult, ListPublicBusinessCasesQuery
from ..ports import BusinessCaseRepository
from ._common import build_list_result, decode_cursor


class ListPublicBusinessCasesUseCase:
    """Return one public-facing business case list slice."""

    def __init__(self, *, business_case_repository: BusinessCaseRepository) -> None:
        self._business_case_repository = business_case_repository

    async def execute(
        self,
        query: ListPublicBusinessCasesQuery,
    ) -> ListBusinessCasesResult:
        page = await self._business_case_repository.list_public(
            limit=query.limit,
            cursor=decode_cursor(query.cursor),
            case_type=query.type,
            industry=query.industry,
            keyword=query.keyword,
        )
        return build_list_result(
            page,
            sort_value_resolver=lambda item: _published_sort_value(item.case_id, item.published_at),
        )


def _published_sort_value(case_id: str, published_at):
    if published_at is None:
        raise InternalServerException(
            message="Published business case is missing published_at.",
            details={"case_id": case_id},
        )
    return published_at
