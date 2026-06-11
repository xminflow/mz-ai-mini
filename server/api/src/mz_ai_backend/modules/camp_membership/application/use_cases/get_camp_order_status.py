from __future__ import annotations

from ...domain import (
    CampMembershipOrderForbiddenException,
    CampMembershipOrderNotFoundException,
    CampOrderStatus,
)
from ..dtos import CampMembershipOrderStatusResult, GetCampOrderStatusQuery
from ..ports import CampMembershipRepository, CurrentTimeProvider


class GetCampOrderStatusUseCase:
    """返回当前账号的一笔订单状态。"""

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider

    async def execute(self, query: GetCampOrderStatusQuery) -> CampMembershipOrderStatusResult:
        order = await self._repository.get_order_by_order_no(order_no=query.order_no)
        if order is None:
            raise CampMembershipOrderNotFoundException()
        if order.account_id != query.account_id:
            raise CampMembershipOrderForbiddenException()

        return CampMembershipOrderStatusResult(
            order_no=order.order_no,
            sku=order.sku,
            amount_fen=order.amount_fen,
            status=order.status,
            # pending 时回二维码地址供前端展示，paid/closed 不再回。
            code_url=order.code_url if order.status == CampOrderStatus.PENDING else None,
            paid_at=order.paid_at,
            membership_applied=order.membership_applied,
            membership_started_at=order.membership_started_at,
            membership_expires_at=order.membership_expires_at,
        )
