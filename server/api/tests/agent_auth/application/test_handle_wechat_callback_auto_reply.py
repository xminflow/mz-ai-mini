from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from mz_ai_backend.modules.agent_auth.application.ports import OfficialWechatInboundMessage
from mz_ai_backend.modules.agent_auth.application.use_cases.handle_wechat_callback import (
    HandleAgentWechatCallbackUseCase,
)

_REPLY_XML = "<xml><Encrypt><![CDATA[encrypted-news]]></Encrypt></xml>"


class _StubSnowflake:
    def __init__(self) -> None:
        self._value = 1000

    def generate(self) -> int:
        self._value += 1
        return self._value


class _FakeGateway:
    """伪造网关：固定返回预设入站消息，并记录被动回复构造调用。"""

    def __init__(self, message: OfficialWechatInboundMessage) -> None:
        self._message = message
        self.news_calls: list[dict[str, str]] = []

    def verify_msg_signature(self, **_kwargs: object) -> bool:
        return True

    def verify_callback_signature(self, **_kwargs: object) -> bool:
        return True

    def parse_inbound_message(self, _xml_body: str) -> OfficialWechatInboundMessage:
        return self._message

    def build_subscribe_news_reply(self, **kwargs: str) -> str:
        self.news_calls.append(kwargs)
        return _REPLY_XML


class _FakeRepo:
    def __init__(self) -> None:
        self.session_lookups: list[str] = []

    async def get_wechat_identity_by_openid(self, _openid: str):
        return None

    async def create_account(self, registration):
        return registration

    async def create_wechat_identity(self, _payload) -> None:
        return None

    async def update_wechat_identity(self, _payload) -> None:
        return None

    async def get_wechat_login_session_by_scene_key(self, scene_key: str):
        self.session_lookups.append(scene_key)
        return None

    async def mark_wechat_login_session_authenticated(self, **_kwargs: object) -> None:
        return None


def _command() -> HandleAgentWechatCallbackCommand:
    return HandleAgentWechatCallbackCommand(
        signature="sig",
        msg_signature="msgsig",
        timestamp="1",
        nonce="2",
        xml_body="<xml/>",
    )


def _message(*, msg_type: str, event_type: str | None, event_key: str | None) -> OfficialWechatInboundMessage:
    return OfficialWechatInboundMessage(
        msg_type=msg_type,
        official_openid="openid-1",
        to_user_name="gh_official",
        event_type=event_type,
        event_key=event_key,
        ticket=None,
        content=None,
        message_time=datetime.now(UTC).replace(tzinfo=None),
    )


def _use_case(gateway: _FakeGateway, repo: _FakeRepo, *, enabled: bool = True) -> HandleAgentWechatCallbackUseCase:
    return HandleAgentWechatCallbackUseCase(
        account_repository=repo,
        wechat_gateway=gateway,
        snowflake_id_generator=_StubSnowflake(),
        auto_reply_enabled=enabled,
        auto_reply_subscribe_news_title="加入微域生光",
        auto_reply_subscribe_news_description="可以联系下方客服人员进入社群",
        auto_reply_subscribe_news_pic_url="http://example.com/qr.jpg",
        auto_reply_subscribe_news_url=None,
    )


@pytest.mark.asyncio
async def test_normal_subscribe_returns_news_reply() -> None:
    """普通关注：返回单图文被动回复 XML，且用对了 openid 与公众号 ID。"""
    gateway = _FakeGateway(_message(msg_type="event", event_type="subscribe", event_key=None))
    repo = _FakeRepo()
    reply = await _use_case(gateway, repo).execute(_command())

    assert reply == _REPLY_XML
    assert len(gateway.news_calls) == 1
    call = gateway.news_calls[0]
    assert call["to_user_openid"] == "openid-1"
    assert call["from_user_name"] == "gh_official"
    assert call["title"] == "加入微域生光"
    # Url 未配置时回退到图片地址
    assert call["url"] == "http://example.com/qr.jpg"


@pytest.mark.asyncio
async def test_plain_text_message_returns_none_without_error() -> None:
    """用户发普通文本消息：无被动回复，也不抛错（修复历史 500）。"""
    gateway = _FakeGateway(_message(msg_type="text", event_type=None, event_key=None))
    reply = await _use_case(gateway, _FakeRepo()).execute(_command())

    assert reply is None
    assert gateway.news_calls == []


@pytest.mark.asyncio
async def test_login_qr_subscribe_does_not_auto_reply() -> None:
    """扫码登录引发的关注（scene=agent-login-*）：不回图文，只走登录绑定。"""
    gateway = _FakeGateway(
        _message(msg_type="event", event_type="subscribe", event_key="qrscene_agent-login-1001")
    )
    repo = _FakeRepo()
    reply = await _use_case(gateway, repo).execute(_command())

    assert reply is None
    assert gateway.news_calls == []
    assert repo.session_lookups == ["agent-login-1001"]


@pytest.mark.asyncio
async def test_scan_event_does_not_auto_reply() -> None:
    """已关注用户再次扫码(SCAN)：属于登录动作，不回图文。"""
    gateway = _FakeGateway(_message(msg_type="event", event_type="SCAN", event_key="agent-login-1001"))
    repo = _FakeRepo()
    reply = await _use_case(gateway, repo).execute(_command())

    assert reply is None
    assert gateway.news_calls == []


@pytest.mark.asyncio
async def test_auto_reply_disabled_returns_none() -> None:
    """开关关闭：普通关注也不回图文。"""
    gateway = _FakeGateway(_message(msg_type="event", event_type="subscribe", event_key=None))
    reply = await _use_case(gateway, _FakeRepo(), enabled=False).execute(_command())

    assert reply is None
    assert gateway.news_calls == []
