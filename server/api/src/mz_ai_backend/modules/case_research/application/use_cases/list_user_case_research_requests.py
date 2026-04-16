from __future__ import annotations

from ..dtos import (
    CaseResearchRequestSummary,
    ListUserCaseResearchRequestsQuery,
    ListUserCaseResearchRequestsResult,
)
from ..ports import CaseResearchRepository


class ListUserCaseResearchRequestsUseCase:
    """Return all private case research requests for the current user."""

    def __init__(self, *, case_research_repository: CaseResearchRepository) -> None:
        self._case_research_repository = case_research_repository

    async def execute(
        self,
        query: ListUserCaseResearchRequestsQuery,
    ) -> ListUserCaseResearchRequestsResult:
        requests = await self._case_research_repository.list_private_requests_by_openid(
            openid=query.identity.openid,
        )
        items = [
            CaseResearchRequestSummary(
                request_id=r.request_id,
                title=r.title,
                description=r.description,
                status=r.status,
                linked_case_id=r.linked_case_id,
                created_at=r.created_at,
            )
            for r in requests
        ]
        return ListUserCaseResearchRequestsResult(items=items)
