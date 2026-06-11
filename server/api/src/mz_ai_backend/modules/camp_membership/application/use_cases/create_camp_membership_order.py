from __future__ import annotations

from datetime import timedelta

from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.shared.wechat_pay import WechatPayNativeCreateOrderRequest

from ...domain import (
    MEMBERSHIP_QR_TTL_SECONDS,
    CampMembershipAlreadyActiveException,
    CampMembershipSku,
    CampOrderStatus,
)
from ..dtos import (
    CampMembershipOrderRegistration,
    CreateCampMembershipOrderCommand,
    CreateCampMembershipOrderResult,
)
from ..ports import (
    CampMembershipRepository,
    CurrentTimeProvider,
    SnowflakeIdGenerator,
    WechatPayNativeGateway,
)

camp_membership_logger = get_logger("mz_ai_backend.camp_membership")


class CreateCampMembershipOrderUseCase:
    """创建一笔 ai-camp 会员 Native 支付订单。

    购买资格：仅当账号当前无有效会员（NONE 或已过期）才允许下单；
    有有效会员期间下单直接拒绝（不升级、不叠加续费）。
    """

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayNativeGateway,
        sku_prices: dict[CampMembershipSku, int],
    ) -> None:
        self._repository = repository
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway
        self._sku_prices = sku_prices

    async def execute(
        self, command: CreateCampMembershipOrderCommand
    ) -> CreateCampMembershipOrderResult:
        now = self._current_time_provider.now()

        # 购买资格校验：有有效会员则拒单，明确错误语义，不静默兜底。
        snapshot = await self._repository.get_membership_snapshot(
            account_id=command.account_id,
            now=now,
        )
        if snapshot.is_active:
            camp_membership_logger.info(
                "camp_membership.order.rejected_active account_id=%s tier=%s expires_at=%s",
                command.account_id,
                snapshot.tier.value,
                snapshot.expires_at,
            )
            raise CampMembershipAlreadyActiveException()

        amount_fen = self._sku_prices[command.sku]

        order_id = self._snowflake_id_generator.generate()
        order_no = f"CAMP{order_id}"
        order = await self._repository.create_pending_order(
            CampMembershipOrderRegistration(
                order_id=order_id,
                order_no=order_no,
                account_id=command.account_id,
                sku=command.sku,
                amount_fen=amount_fen,
            )
        )

        native_result = await self._wechat_pay_gateway.create_native_order(
            WechatPayNativeCreateOrderRequest(
                order_no=order.order_no,
                amount_fen=order.amount_fen,
                description="微域生光 AI 编程训练营会员",
            )
        )
        order = await self._repository.update_order_code_url(
            order_no=order.order_no,
            code_url=native_result.code_url,
        )
        qr_expires_at = order.created_at + timedelta(seconds=MEMBERSHIP_QR_TTL_SECONDS)

        camp_membership_logger.info(
            "camp_membership.order.created order_no=%s account_id=%s sku=%s amount_fen=%s",
            order.order_no,
            order.account_id,
            order.sku.value,
            order.amount_fen,
        )
        camp_membership_logger.debug(
            "camp_membership.order.code_url_attached order_no=%s code_url_prefix=%s",
            order.order_no,
            order.code_url[:16] if order.code_url else None,
        )
        return CreateCampMembershipOrderResult(
            order_no=order.order_no,
            sku=CampMembershipSku(order.sku),
            amount_fen=order.amount_fen,
            status=CampOrderStatus(order.status),
            code_url=order.code_url or native_result.code_url,
            qr_expires_at=qr_expires_at,
        )
