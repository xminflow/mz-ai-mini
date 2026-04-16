from __future__ import annotations

from ...domain import CaseResearchOrderNotFoundException
from ..dtos import GetCaseResearchOrderQuery, GetCaseResearchOrderResult
from ..ports import CaseResearchRepository


class GetCaseResearchOrderUseCase:
    """Return one case research order for the current user."""

    def __init__(self, *, case_research_repository: CaseResearchRepository) -> None:
        self._case_research_repository = case_research_repository

    async def execute(
        self,
        query: GetCaseResearchOrderQuery,
    ) -> GetCaseResearchOrderResult:
        order = await self._case_research_repository.get_order_by_order_no_and_openid(
            order_no=query.order_no,
            openid=query.identity.openid,
        )
        if order is None:
            raise CaseResearchOrderNotFoundException()

        return GetCaseResearchOrderResult(
            order_no=order.order_no,
            amount_fen=order.amount_fen,
            status=order.status,
            request_applied=order.request_applied,
            request_id=order.request_id,
        )
