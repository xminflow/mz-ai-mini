from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.wechat_callback.application.dispatcher import WechatCallbackDispatcher
from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatInboundMessage


class _Gateway:
    def __init__(self, message: OfficialWechatInboundMessage) -> None:
        self._m = message

    def verify_msg_signature(self, **k: object) -> bool:
        return True

    def verify_callback_signature(self, **k: object) -> bool:
        return True

    def parse_inbound_message(self, xml: str) -> OfficialWechatInboundMessage:
        return self._m


class _Handler:
    def __init__(self, reply: str | None = None) -> None:
        self.calls: list[tuple[str | None, str | None]] = []
        self._reply = reply

    async def handle_message(
        self,
        message: OfficialWechatInboundMessage,
        scene_key: str | None,
    ) -> str | None:
        self.calls.append((message.event_type, scene_key))
        return self._reply


def _msg(event_type: str | None, event_key: str | None = None) -> OfficialWechatInboundMessage:
    return OfficialWechatInboundMessage(
        msg_type="event",
        official_openid="openid_x",
        to_user_name="gh",
        event_type=event_type,
        event_key=event_key,
        ticket=None,
        content=None,
        message_time=datetime.now(UTC).replace(tzinfo=None),
    )


def _cmd() -> HandleAgentWechatCallbackCommand:
    return HandleAgentWechatCallbackCommand(
        signature="s",
        msg_signature=None,
        timestamp="t",
        nonce="n",
        xml_body="<xml/>",
    )


@pytest.mark.asyncio
async def test_camp_login_scene_routes_only_to_camp() -> None:
    """camp-login-* scene：只分发给 camp，不调用 agent，reply 为 None。"""
    agent, camp = _Handler(reply="<xml>r</xml>"), _Handler()
    d = WechatCallbackDispatcher(
        wechat_gateway=_Gateway(_msg("subscribe", "qrscene_camp-login-7")),
        agent_handler=agent,
        camp_handler=camp,
    )
    reply = await d.dispatch(_cmd())
    assert camp.calls == [("subscribe", "camp-login-7")]
    assert agent.calls == []
    assert reply is None


@pytest.mark.asyncio
async def test_agent_login_scene_routes_only_to_agent() -> None:
    """agent-login-* scene：只分发给 agent，不调用 camp。"""
    agent, camp = _Handler(reply=None), _Handler()
    d = WechatCallbackDispatcher(
        wechat_gateway=_Gateway(_msg("SCAN", "agent-login-3")),
        agent_handler=agent,
        camp_handler=camp,
    )
    await d.dispatch(_cmd())
    assert agent.calls == [("SCAN", "agent-login-3")]
    assert camp.calls == []


@pytest.mark.asyncio
async def test_organic_subscribe_goes_to_agent_only() -> None:
    """自然关注（无 scene）：只分发给 agent；camp 不收到调用。"""
    agent, camp = _Handler(reply="<xml>welcome</xml>"), _Handler()
    d = WechatCallbackDispatcher(
        wechat_gateway=_Gateway(_msg("subscribe", None)),
        agent_handler=agent,
        camp_handler=camp,
    )
    reply = await d.dispatch(_cmd())
    assert agent.calls == [("subscribe", None)]
    assert camp.calls == []
    assert reply == "<xml>welcome</xml>"


@pytest.mark.asyncio
async def test_unsubscribe_broadcasts_to_both() -> None:
    """取关（无 scene）：广播给 agent + camp，camp 以 scene_key=None 调用。"""
    agent, camp = _Handler(reply=None), _Handler()
    d = WechatCallbackDispatcher(
        wechat_gateway=_Gateway(_msg("unsubscribe", None)),
        agent_handler=agent,
        camp_handler=camp,
    )
    await d.dispatch(_cmd())
    assert agent.calls == [("unsubscribe", None)]
    assert camp.calls == [("unsubscribe", None)]
