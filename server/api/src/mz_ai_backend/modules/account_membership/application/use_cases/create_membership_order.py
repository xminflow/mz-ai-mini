from __future__ import annotations

import math
from datetime import datetime, timedelta

from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.shared.wechat_pay import WechatPayNativeCreateOrderRequest

from ...domain import MEMBERSHIP_QR_TTL_SECONDS, MembershipSku, MembershipTier, OrderStatus
from ..dtos import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderResult,
    MembershipOrderRegistration,
)
from ..ports import (
    AccountMembershipRepository,
    CurrentTimeProvider,
    SnowflakeIdGenerator,
    WechatPayNativeGateway,
)

account_membership_logger = get_logger("mz_ai_backend.account_membership")


class CreateMembershipOrderUseCase:
    """Create one website membership Native payment order."""

    def __init__(
        self,
        *,
        repository: AccountMembershipRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayNativeGateway,
        sku_prices: dict[MembershipSku, int],
    ) -> None:
        self._repository = repository
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway
        self._sku_prices = sku_prices

    async def execute(self, command: CreateMembershipOrderCommand) -> CreateMembershipOrderResult:
        now = self._current_time_provider.now()
        amount_fen = await self._compute_amount_fen(command=command, now=now)

        order_id = self._snowflake_id_generator.generate()
        order_no = f"WEB{order_id}"
        order = await self._repository.create_pending_order(
            MembershipOrderRegistration(
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
                description="微域生光官网年度会员",
            )
        )
        order = await self._repository.update_order_code_url(
            order_no=order.order_no,
            code_url=native_result.code_url,
        )
        qr_expires_at = order.created_at + timedelta(seconds=MEMBERSHIP_QR_TTL_SECONDS)

        account_membership_logger.info(
            "account_membership.order.created order_no=%s account_id=%s sku=%s amount_fen=%s",
            order.order_no,
            order.account_id,
            order.sku.value,
            order.amount_fen,
        )
        account_membership_logger.debug(
            "account_membership.order.code_url_attached order_no=%s code_url_prefix=%s",
            order.order_no,
            order.code_url[:16] if order.code_url else None,
        )
        return CreateMembershipOrderResult(
            order_no=order.order_no,
            sku=MembershipSku(order.sku),
            amount_fen=order.amount_fen,
            status=OrderStatus(order.status),
            code_url=order.code_url or native_result.code_url,
            qr_expires_at=qr_expires_at,
        )

    async def _compute_amount_fen(
        self,
        *,
        command: CreateMembershipOrderCommand,
        now: datetime,
    ) -> int:
        """Calculate the order amount, applying prorated credit for NORMAL→PREMIUM upgrades."""

        base_price = self._sku_prices[command.sku]
        if command.sku != MembershipSku.ANNUAL_PREMIUM:
            return base_price

        # 检查是否为 NORMAL 有效会员升级；若是，按剩余天数折算差价。
        snapshot = await self._repository.get_membership_snapshot(
            account_id=command.account_id,
            now=now,
        )
        if (
            snapshot.tier == MembershipTier.NORMAL
            and snapshot.is_active
            and snapshot.expires_at is not None
        ):
            remaining_days = max(0, (snapshot.expires_at - now).days)
            normal_price = self._sku_prices.get(MembershipSku.ANNUAL_NORMAL, 19900)
            credit_fen = round(normal_price * remaining_days / 365)
            # 向上取整到整元（整百分），确保支付页展示金额与预计相符。
            amount_fen = math.ceil((base_price - credit_fen) / 100) * 100
            account_membership_logger.debug(
                "account_membership.order.upgrade_credit account_id=%s "
                "remaining_days=%s normal_price=%s credit_fen=%s amount_fen=%s",
                command.account_id,
                remaining_days,
                normal_price,
                credit_fen,
                amount_fen,
            )
            return max(100, amount_fen)  # 最低 ¥1，避免零元订单

        return base_price
