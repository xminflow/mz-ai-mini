from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import MembershipTier
from ..dtos import HandleWechatPayNotifyCommand, MembershipOrderStatusResult
from ..ports import AccountMembershipRepository, CurrentTimeProvider, WechatPayNativeGateway

account_membership_logger = get_logger("mz_ai_backend.account_membership")


class HandleWechatPayNotifyUseCase:
    """Process WeChat Pay callbacks and atomically grant account membership."""

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

    async def execute(self, command: HandleWechatPayNotifyCommand) -> MembershipOrderStatusResult:
        notification = self._wechat_pay_gateway.parse_notification(
            headers=command.headers,
            body=command.body,
        )

        order = await self._repository.process_wechat_pay_notification(
            notification=notification,
            now=self._current_time_provider.now(),
            expected_tier=MembershipTier.NORMAL,
        )
        account_membership_logger.info(
            "account_membership.wechat_notify.handled order_no=%s status=%s trade_state=%s",
            order.order_no,
            order.status.value,
            order.trade_state,
        )
        return MembershipOrderStatusResult(
            order_no=order.order_no,
            sku=order.sku,
            amount_fen=order.amount_fen,
            status=order.status,
            code_url=None,
            paid_at=order.paid_at,
            membership_applied=order.membership_applied,
            membership_started_at=order.membership_started_at,
            membership_expires_at=order.membership_expires_at,
        )
