from __future__ import annotations

from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.modules.auth.domain import UserNotFoundException
from mz_ai_backend.shared.wechat_pay import WechatPayCreateOrderRequest

from ...domain import PRIVATE_CASE_RESEARCH_PRICE_FEN
from ..dtos import (
    CaseResearchOrderRegistration,
    CreateCaseResearchOrderCommand,
    CreateCaseResearchOrderResult,
)
from ..ports import CaseResearchRepository, SnowflakeIdGenerator, WechatPayGateway

case_research_logger = get_logger("mz_ai_backend.case_research")


class CreateCaseResearchOrderUseCase:
    """Create one pending private case research order and return payment params."""

    def __init__(
        self,
        *,
        case_research_repository: CaseResearchRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
        wechat_pay_gateway: WechatPayGateway,
    ) -> None:
        self._case_research_repository = case_research_repository
        self._snowflake_id_generator = snowflake_id_generator
        self._wechat_pay_gateway = wechat_pay_gateway

    async def execute(
        self,
        command: CreateCaseResearchOrderCommand,
    ) -> CreateCaseResearchOrderResult:
        user_id = await self._case_research_repository.get_user_id_by_openid(
            openid=command.identity.openid,
        )
        if user_id is None:
            raise UserNotFoundException()

        order_id = self._snowflake_id_generator.generate()
        order_no = str(order_id)
        amount_fen = PRIVATE_CASE_RESEARCH_PRICE_FEN

        order = await self._case_research_repository.create_pending_order(
            CaseResearchOrderRegistration(
                order_id=order_id,
                order_no=order_no,
                user_id=user_id,
                openid=command.identity.openid,
                amount_fen=amount_fen,
                title=command.title,
                description=command.description,
            )
        )

        payment_result = await self._wechat_pay_gateway.create_order(
            WechatPayCreateOrderRequest(
                order_no=order_no,
                amount_fen=amount_fen,
                description="微域生光商业圈私人案例调研",
                payer_openid=command.identity.openid,
            )
        )
        order = await self._case_research_repository.update_order_prepay_id(
            order_no=order_no,
            prepay_id=payment_result.prepay_id,
        )

        case_research_logger.info(
            "case_research.order_created order_no=%s user_id=%s amount_fen=%s",
            order.order_no,
            order.user_id,
            order.amount_fen,
        )
        return CreateCaseResearchOrderResult(
            order_no=order.order_no,
            amount_fen=order.amount_fen,
            status=order.status,
            payment_params=payment_result.payment_params,
        )
