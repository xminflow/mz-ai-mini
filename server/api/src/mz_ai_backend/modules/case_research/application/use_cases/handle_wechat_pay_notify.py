from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ..dtos import HandleWechatPayNotifyCommand, HandleWechatPayNotifyResult
from ..ports import CaseResearchRepository, SnowflakeIdGenerator, WechatPayGateway

case_research_logger = get_logger("mz_ai_backend.case_research")


class HandleWechatPayNotifyUseCase:
    """Process WeChat Pay callbacks and create private case research requests."""

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
        command: HandleWechatPayNotifyCommand,
    ) -> HandleWechatPayNotifyResult:
        notification = self._wechat_pay_gateway.parse_notification(
            headers=command.headers,
            body=command.body,
        )
        snowflake_id = self._snowflake_id_generator.generate()
        order = await self._case_research_repository.process_wechat_pay_notification(
            notification=notification,
            snowflake_id=snowflake_id,
        )
        case_research_logger.info(
            "case_research.wechat_notify_handled order_no=%s status=%s trade_state=%s",
            order.order_no,
            order.status.value,
            order.trade_state,
        )
        return HandleWechatPayNotifyResult(
            order_no=order.order_no,
            status=order.status,
        )
