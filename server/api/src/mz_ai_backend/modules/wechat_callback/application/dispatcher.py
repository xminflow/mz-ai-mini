from __future__ import annotations

import logging

from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from mz_ai_backend.modules.agent_auth.application.use_cases.handle_wechat_callback import (
    HandleAgentWechatCallbackUseCase,
    _normalize_scene_key,
)
from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatGateway
from mz_ai_backend.modules.agent_auth.domain import AgentWechatCallbackInvalidException
from mz_ai_backend.modules.camp_auth.application.use_cases.handle_wechat_callback import (
    HandleCampWechatCallbackUseCase,
    LOGIN_SCENE_PREFIX as CAMP_LOGIN_SCENE_PREFIX,
)

logger = logging.getLogger(__name__)

AGENT_LOGIN_SCENE_PREFIX = "agent-login-"


class WechatCallbackDispatcher:
    """独占公众号回调：共享「签名校验 + 解析」，再按 scene 前缀 / 事件类型分发。

    分发规则：
    - scene 前缀 camp-login- → 仅 camp.handle_message
    - scene 前缀 agent-login- → 仅 agent.handle_message
    - 无登录 scene 的 subscribe（自然关注）→ 仅 agent.handle_message
    - 无 scene 的 unsubscribe（取关）→ 广播 agent + camp
    返回 agent 的被动回复 XML（camp 不产生回复）。scene_key 在此统一归一化（去 qrscene_）后传给 handler。
    """

    def __init__(
        self,
        *,
        wechat_gateway: OfficialWechatGateway,
        agent_handler: HandleAgentWechatCallbackUseCase,
        camp_handler: HandleCampWechatCallbackUseCase,
    ) -> None:
        self._gateway = wechat_gateway
        self._agent = agent_handler
        self._camp = camp_handler

    async def dispatch(self, command: HandleAgentWechatCallbackCommand) -> str | None:
        if command.msg_signature:
            valid = self._gateway.verify_msg_signature(
                msg_signature=command.msg_signature, timestamp=command.timestamp,
                nonce=command.nonce, xml_body=command.xml_body,
            )
        else:
            valid = self._gateway.verify_callback_signature(
                signature=command.signature, timestamp=command.timestamp, nonce=command.nonce,
            )
        if not valid:
            raise AgentWechatCallbackInvalidException(message="WeChat callback signature is invalid.")

        message = self._gateway.parse_inbound_message(command.xml_body)
        if message.msg_type != "event" or message.event_type is None:
            logger.debug("wechat callback: non-event ignored msg_type=%s", message.msg_type)
            return None

        scene_key = _normalize_scene_key(message.event_key)

        if scene_key is not None and scene_key.startswith(CAMP_LOGIN_SCENE_PREFIX):
            await self._camp.handle_message(message, scene_key)
            return None
        if scene_key is not None and scene_key.startswith(AGENT_LOGIN_SCENE_PREFIX):
            return await self._agent.handle_message(message, scene_key)

        reply = await self._agent.handle_message(message, scene_key)
        if message.event_type == "unsubscribe":
            await self._camp.handle_message(message, None)
        return reply
