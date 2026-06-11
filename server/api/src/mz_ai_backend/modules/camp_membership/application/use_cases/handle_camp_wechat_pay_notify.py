from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import CampMembershipSku, CampMembershipTier
from ..dtos import CampMembershipOrderStatusResult, HandleCampWechatPayNotifyCommand
from ..ports import CampMembershipRepository, CurrentTimeProvider, WechatPayNativeGateway

camp_membership_logger = get_logger("mz_ai_backend.camp_membership")


class HandleCampWechatPayNotifyUseCase:
    """处理微信支付回调并原子化授予 ai-camp 会员。"""

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayNativeGateway,
        sku_tier_map: dict[CampMembershipSku, CampMembershipTier],
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway
        self._sku_tier_map = sku_tier_map

    async def execute(
        self, command: HandleCampWechatPayNotifyCommand
    ) -> CampMembershipOrderStatusResult:
        notification = self._wechat_pay_gateway.parse_notification(
            headers=command.headers,
            body=command.body,
        )

        order = await self._repository.process_wechat_pay_notification(
            notification=notification,
            now=self._current_time_provider.now(),
            sku_tier_map=self._sku_tier_map,
        )
        camp_membership_logger.info(
            "camp_membership.wechat_notify.handled order_no=%s status=%s trade_state=%s",
            order.order_no,
            order.status.value,
            order.trade_state,
        )
        return CampMembershipOrderStatusResult(
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
