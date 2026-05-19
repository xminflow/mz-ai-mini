from __future__ import annotations

from datetime import timedelta

from ...domain import (
    AccountMembershipOrderForbiddenException,
    AccountMembershipOrderNotFoundException,
    MembershipTier,
    OrderStatus,
)
from ..dtos import GetOrderStatusQuery, MembershipOrderStatusResult
from ..ports import AccountMembershipRepository, CurrentTimeProvider, WechatPayNativeGateway


class GetOrderStatusUseCase:
    """Return one order status for the current account."""

    def __init__(
        self,
        *,
        repository: AccountMembershipRepository,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayNativeGateway,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway

    async def execute(self, query: GetOrderStatusQuery) -> MembershipOrderStatusResult:
        now = self._current_time_provider.now()
        order = await self._repository.get_order_by_order_no(order_no=query.order_no)
        if order is None:
            raise AccountMembershipOrderNotFoundException()
        if order.account_id != query.account_id:
            raise AccountMembershipOrderForbiddenException()

        if self._should_query_wechat(order_status=order.status, last_query_at=order.last_wechat_query_at, now=now):
            notification = await self._wechat_pay_gateway.query_order(order_no=order.order_no)
            await self._repository.mark_order_wechat_query_attempted(
                order_no=order.order_no,
                queried_at=now,
            )
            if notification is not None:
                order = await self._repository.process_wechat_pay_notification(
                    notification=notification,
                    now=now,
                    expected_tier=MembershipTier.NORMAL,
                )

        return MembershipOrderStatusResult(
            order_no=order.order_no,
            sku=order.sku,
            amount_fen=order.amount_fen,
            status=order.status,
            code_url=order.code_url if order.status == OrderStatus.PENDING else None,
            paid_at=order.paid_at,
            membership_applied=order.membership_applied,
            membership_started_at=order.membership_started_at,
            membership_expires_at=order.membership_expires_at,
        )

    @staticmethod
    def _should_query_wechat(
        *,
        order_status: OrderStatus,
        last_query_at,
        now,
    ) -> bool:
        if order_status != OrderStatus.PENDING:
            return False
        if last_query_at is None:
            return True
        return now - last_query_at >= timedelta(seconds=30)
