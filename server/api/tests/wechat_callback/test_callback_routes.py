from __future__ import annotations

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import get_official_wechat_gateway
from mz_ai_backend.modules.wechat_callback.infrastructure.dependencies import (
    get_wechat_callback_dispatcher,
)


class StubWechatGateway:
    def verify_callback_signature(self, *, signature, timestamp, nonce) -> bool:
        return signature == "valid-signature" and timestamp == "1" and nonce == "2"


class StubDispatcher:
    def __init__(self, reply: str | None = None) -> None:
        self.commands: list[HandleAgentWechatCallbackCommand] = []
        self._reply = reply

    async def dispatch(self, command: HandleAgentWechatCallbackCommand) -> str | None:
        self.commands.append(command)
        return self._reply


def _build_client(
    *,
    gateway: StubWechatGateway | None = None,
    dispatcher: StubDispatcher | None = None,
) -> TestClient:
    app = create_app()
    if gateway is not None:
        app.dependency_overrides[get_official_wechat_gateway] = lambda: gateway
    if dispatcher is not None:
        app.dependency_overrides[get_wechat_callback_dispatcher] = lambda: dispatcher
    return TestClient(app, raise_server_exceptions=False)


def test_wechat_callback_route_verifies_signature() -> None:
    """GET /callback：校验签名通过时回显 echostr。"""
    with _build_client(gateway=StubWechatGateway()) as client:
        response = client.get(
            "/api/v1/agent-auth/wechat-official/callback",
            params={
                "signature": "valid-signature",
                "timestamp": "1",
                "nonce": "2",
                "echostr": "hello",
            },
        )

    assert response.status_code == 200
    assert response.text == "hello"


def test_wechat_callback_route_handles_post_returns_success() -> None:
    """POST /callback：dispatcher.dispatch 被调用，无回复时返回 "success"。"""
    stub_dispatcher = StubDispatcher(reply=None)
    with _build_client(dispatcher=stub_dispatcher) as client:
        response = client.post(
            "/api/v1/agent-auth/wechat-official/callback",
            params={
                "signature": "valid-signature",
                "timestamp": "1",
                "nonce": "2",
            },
            content=(
                "<xml><FromUserName>openid-1</FromUserName><CreateTime>1</CreateTime>"
                "<Event>subscribe</Event><EventKey>qrscene_agent-login-1</EventKey></xml>"
            ),
        )

    assert response.status_code == 200
    assert response.text == "success"
    assert len(stub_dispatcher.commands) == 1
    cmd = stub_dispatcher.commands[0]
    assert cmd.signature == "valid-signature"
    assert cmd.timestamp == "1"
    assert cmd.nonce == "2"
