from __future__ import annotations

from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.modules.auth.domain import UserNotFoundException

from ...domain import (
    NORMAL_MEMBERSHIP_PRICE_FEN,
    MembershipAlreadyActiveException,
    MembershipPlanNotOpenException,
    MembershipTier,
)
from ..dtos import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderResult,
    MembershipOrderRegistration,
    WechatPayCreateOrderRequest,
)
from ..ports import (
    CurrentTimeProvider,
    MembershipRepository,
    SnowflakeIdGenerator,
    WechatPayGateway,
)

membership_logger = get_logger("mz_ai_backend.membership")


class CreateMembershipOrderUseCase:
    """Create one pending membership order and return payment params."""

    def __init__(
        self,
        *,
        membership_repository: MembershipRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayGateway,
    ) -> None:
        self._membership_repository = membership_repository
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway

    async def execute(
        self,
        command: CreateMembershipOrderCommand,
    ) -> CreateMembershipOrderResult:
        if command.tier != MembershipTier.NORMAL:
            raise MembershipPlanNotOpenException()

        now = self._current_time_provider.now()
        user_membership = (
            await self._membership_repository.get_user_membership_by_openid(
                openid=command.identity.openid,
                now=now,
            )
        )
        if user_membership is None:
            raise UserNotFoundException()

        if user_membership.tier == MembershipTier.NORMAL and user_membership.is_active:
            raise MembershipAlreadyActiveException()

        order_id = self._snowflake_id_generator.generate()
        order_no = str(order_id)
        amount_fen = NORMAL_MEMBERSHIP_PRICE_FEN
        order = await self._membership_repository.create_pending_order(
            MembershipOrderRegistration(
                order_id=order_id,
                order_no=order_no,
                user_id=user_membership.user_id,
                openid=user_membership.openid,
                tier=command.tier,
                amount_fen=amount_fen,
            )
        )

        payment_result = await self._wechat_pay_gateway.create_order(
            WechatPayCreateOrderRequest(
                order_no=order_no,
                amount_fen=amount_fen,
                description="妙智AI商业圈普通会员",
                payer_openid=command.identity.openid,
            )
        )
        order = await self._membership_repository.update_order_prepay_id(
            order_no=order_no,
            prepay_id=payment_result.prepay_id,
        )

        membership_logger.info(
            "membership.order_created order_no=%s user_id=%s tier=%s amount_fen=%s",
            order.order_no,
            order.user_id,
            order.tier.value,
            order.amount_fen,
        )
        return CreateMembershipOrderResult(
            order_no=order.order_no,
            tier=order.tier,
            amount_fen=order.amount_fen,
            status=order.status,
            payment_params=payment_result.payment_params,
        )
