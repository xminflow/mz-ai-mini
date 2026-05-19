from __future__ import annotations

from datetime import timedelta

from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.shared.wechat_pay import WechatPayNativeCreateOrderRequest

from ...domain import MEMBERSHIP_QR_TTL_SECONDS, MembershipSku, OrderStatus
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
        annual_amount_fen: int,
    ) -> None:
        self._repository = repository
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway
        self._annual_amount_fen = annual_amount_fen

    async def execute(self, command: CreateMembershipOrderCommand) -> CreateMembershipOrderResult:
        order_id = self._snowflake_id_generator.generate()
        order_no = f"WEB{order_id}"
        order = await self._repository.create_pending_order(
            MembershipOrderRegistration(
                order_id=order_id,
                order_no=order_no,
                account_id=command.account_id,
                sku=command.sku,
                amount_fen=self._annual_amount_fen,
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
