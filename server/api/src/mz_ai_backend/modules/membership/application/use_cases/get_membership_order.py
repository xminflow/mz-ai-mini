from __future__ import annotations

from ...domain import MembershipOrderNotFoundException
from ..dtos import GetMembershipOrderQuery, GetMembershipOrderResult
from ..ports import MembershipRepository


class GetMembershipOrderUseCase:
    """Return one membership order for the current user."""

    def __init__(self, *, membership_repository: MembershipRepository) -> None:
        self._membership_repository = membership_repository

    async def execute(
        self,
        query: GetMembershipOrderQuery,
    ) -> GetMembershipOrderResult:
        order = await self._membership_repository.get_order_by_order_no_and_openid(
            order_no=query.order_no,
            openid=query.identity.openid,
        )
        if order is None:
            raise MembershipOrderNotFoundException()

        return GetMembershipOrderResult(
            order_no=order.order_no,
            tier=order.tier,
            amount_fen=order.amount_fen,
            status=order.status,
            membership_applied=order.membership_applied,
            membership_started_at=order.membership_started_at,
            membership_expires_at=order.membership_expires_at,
        )
