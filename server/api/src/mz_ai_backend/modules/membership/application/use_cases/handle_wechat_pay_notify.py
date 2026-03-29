from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import (
    MembershipTier,
    NORMAL_MEMBERSHIP_DURATION_DAYS,
)
from ..dtos import HandleWechatPayNotifyCommand, HandleWechatPayNotifyResult
from ..ports import CurrentTimeProvider, MembershipRepository, WechatPayGateway


membership_logger = get_logger("mz_ai_backend.membership")


class HandleWechatPayNotifyUseCase:
    """Process WeChat Pay callbacks and apply membership upgrades."""

    def __init__(
        self,
        *,
        membership_repository: MembershipRepository,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayGateway,
    ) -> None:
        self._membership_repository = membership_repository
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway

    async def execute(
        self,
        command: HandleWechatPayNotifyCommand,
    ) -> HandleWechatPayNotifyResult:
        notification = self._wechat_pay_gateway.parse_notification(
            headers=command.headers,
            body=command.body,
        )
        order = await self._membership_repository.process_wechat_pay_notification(
            notification=notification,
            now=self._current_time_provider.now(),
            membership_duration_days=NORMAL_MEMBERSHIP_DURATION_DAYS,
            expected_tier=MembershipTier.NORMAL,
        )
        membership_logger.info(
            "membership.wechat_notify_handled order_no=%s status=%s trade_state=%s",
            order.order_no,
            order.status.value,
            order.trade_state,
        )
        return HandleWechatPayNotifyResult(
            order_no=order.order_no,
            status=order.status,
        )
