from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.agent_auth.application import (
    AgentAccountSummary,
    AgentAuthenticationResult,
    AgentEmailVerificationChallengeSummary,
    AgentTokenPair,
    AgentWechatLoginSessionStatusResult,
    ChangeAgentUsernameResult,
    CreateAgentWechatLoginSessionResult,
    RequestEmailBindingChallengeResult,
    VerifyEmailBindingChallengeResult,
)
from mz_ai_backend.modules.agent_auth.domain import AgentAccountStatus, AgentWechatLoginSessionStatus
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import (
    get_change_agent_username_use_case,
    get_create_wechat_login_session_use_case,
    get_exchange_wechat_login_use_case,
    get_get_wechat_login_session_use_case,
    get_handle_wechat_callback_use_case,
    get_official_wechat_gateway,
    get_request_email_binding_challenge_use_case,
    get_verify_email_binding_challenge_use_case,
)


class StubCreateWechatLoginSessionUseCase:
    async def execute(self, _command):
        return CreateAgentWechatLoginSessionResult(
            session={
                "login_session_id": 1001,
                "status": AgentWechatLoginSessionStatus.PENDING,
                "qr_code_url": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=abc",
                "expires_at": datetime.now(UTC) + timedelta(minutes=5),
                "poll_interval_ms": 2000,
            }
        )


class StubGetWechatLoginSessionUseCase:
    async def execute(self, query):
        return AgentWechatLoginSessionStatusResult(
            login_session_id=query.login_session_id,
            status=AgentWechatLoginSessionStatus.AUTHENTICATED,
            expires_at=datetime.now(UTC) + timedelta(minutes=3),
        )


class StubExchangeWechatLoginUseCase:
    async def execute(self, command):
        assert command.login_session_id == 1001
        return AgentAuthenticationResult(
            account=AgentAccountSummary(
                account_id=2001,
                username="wxoa_2001",
                email=None,
                status=AgentAccountStatus.ACTIVE,
                created_at=datetime.now(UTC),
            ),
            tokens=AgentTokenPair(
                access_token="access-1",
                access_token_expires_at=datetime.now(UTC) + timedelta(minutes=30),
                refresh_token="refresh-1",
                refresh_token_expires_at=datetime.now(UTC) + timedelta(days=30),
            ),
        )


class StubHandleWechatCallbackUseCase:
    def __init__(self) -> None:
        self.commands: list[object] = []

    async def execute(self, command) -> None:
        self.commands.append(command)


class StubWechatGateway:
    def verify_callback_signature(self, *, signature, timestamp, nonce) -> bool:
        return signature == "valid-signature" and timestamp == "1" and nonce == "2"


class StubRequestEmailBindingChallengeUseCase:
    async def execute(self, command):
        assert command.email == "demo@example.com"
        assert command.access_token == "stub-token"
        return RequestEmailBindingChallengeResult(
            challenge=AgentEmailVerificationChallengeSummary(
                login_challenge_id=9001,
                expires_at=datetime.now(UTC) + timedelta(minutes=10),
                cooldown_seconds=60,
            )
        )


class StubVerifyEmailBindingChallengeUseCase:
    async def execute(self, command):
        assert command.login_challenge_id == 9001
        assert command.verification_code == "123456"
        return VerifyEmailBindingChallengeResult(
            account=AgentAccountSummary(
                account_id=2002,
                username="wxoa_2002",
                email="demo@example.com",
                status=AgentAccountStatus.ACTIVE,
                created_at=datetime.now(UTC),
            )
        )


class StubChangeAgentUsernameUseCase:
    async def execute(self, command):
        assert command.new_username == "new_name_42"
        return ChangeAgentUsernameResult(
            account=AgentAccountSummary(
                account_id=3003,
                username="new_name_42",
                email=None,
                status=AgentAccountStatus.ACTIVE,
                created_at=datetime.now(UTC),
            )
        )


def _build_client(
    *,
    create_use_case: StubCreateWechatLoginSessionUseCase | None = None,
    status_use_case: StubGetWechatLoginSessionUseCase | None = None,
    exchange_use_case: StubExchangeWechatLoginUseCase | None = None,
    callback_use_case: StubHandleWechatCallbackUseCase | None = None,
    request_email_binding_use_case: StubRequestEmailBindingChallengeUseCase | None = None,
    verify_email_binding_use_case: StubVerifyEmailBindingChallengeUseCase | None = None,
    change_username_use_case: StubChangeAgentUsernameUseCase | None = None,
    gateway: StubWechatGateway | None = None,
) -> TestClient:
    app = create_app()
    if create_use_case is not None:
        app.dependency_overrides[get_create_wechat_login_session_use_case] = lambda: create_use_case
    if status_use_case is not None:
        app.dependency_overrides[get_get_wechat_login_session_use_case] = lambda: status_use_case
    if exchange_use_case is not None:
        app.dependency_overrides[get_exchange_wechat_login_use_case] = lambda: exchange_use_case
    if callback_use_case is not None:
        app.dependency_overrides[get_handle_wechat_callback_use_case] = lambda: callback_use_case
    if request_email_binding_use_case is not None:
        app.dependency_overrides[get_request_email_binding_challenge_use_case] = (
            lambda: request_email_binding_use_case
        )
    if verify_email_binding_use_case is not None:
        app.dependency_overrides[get_verify_email_binding_challenge_use_case] = (
            lambda: verify_email_binding_use_case
        )
    if change_username_use_case is not None:
        app.dependency_overrides[get_change_agent_username_use_case] = lambda: change_username_use_case
    if gateway is not None:
        app.dependency_overrides[get_official_wechat_gateway] = lambda: gateway
    return TestClient(app, raise_server_exceptions=False)


def test_agent_auth_router_creates_wechat_login_session() -> None:
    with _build_client(create_use_case=StubCreateWechatLoginSessionUseCase()) as client:
        response = client.post("/api/v1/agent-auth/wechat-official/login-sessions")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["login_session_id"] == "1001"
    assert body["data"]["status"] == "pending"


def test_agent_auth_router_reads_wechat_login_session_status() -> None:
    with _build_client(status_use_case=StubGetWechatLoginSessionUseCase()) as client:
        response = client.get("/api/v1/agent-auth/wechat-official/login-sessions/1001")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["login_session_id"] == "1001"
    assert body["data"]["status"] == "authenticated"


def test_agent_auth_router_exchanges_wechat_login_session() -> None:
    with _build_client(exchange_use_case=StubExchangeWechatLoginUseCase()) as client:
        response = client.post(
            "/api/v1/agent-auth/wechat-official/login-sessions/1001/exchange",
            json={},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["account"]["account_id"] == "2001"
    assert body["data"]["tokens"]["access_token"] == "access-1"
    assert body["data"]["tokens"]["access_token_expires_at"].endswith("Z")
    assert body["data"]["tokens"]["refresh_token_expires_at"].endswith("Z")


def test_agent_auth_router_verifies_wechat_callback() -> None:
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


def test_agent_auth_router_requests_email_binding_challenge() -> None:
    with _build_client(
        request_email_binding_use_case=StubRequestEmailBindingChallengeUseCase()
    ) as client:
        response = client.post(
            "/api/v1/agent-auth/me/email-binding/challenges",
            json={"email": "demo@example.com"},
            headers={"Authorization": "Bearer stub-token"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["login_challenge_id"] == "9001"
    assert body["data"]["cooldown_seconds"] == 60


def test_agent_auth_router_verifies_email_binding_challenge() -> None:
    with _build_client(
        verify_email_binding_use_case=StubVerifyEmailBindingChallengeUseCase()
    ) as client:
        response = client.post(
            "/api/v1/agent-auth/me/email-binding/challenges/9001/verify",
            json={"verification_code": "123456"},
            headers={"Authorization": "Bearer stub-token"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["account"]["email"] == "demo@example.com"
    assert body["data"]["account"]["account_id"] == "2002"


def test_agent_auth_router_changes_username() -> None:
    with _build_client(change_username_use_case=StubChangeAgentUsernameUseCase()) as client:
        response = client.patch(
            "/api/v1/agent-auth/me/username",
            json={"new_username": "new_name_42"},
            headers={"Authorization": "Bearer stub-token"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["account"]["username"] == "new_name_42"


def test_agent_auth_router_change_username_rejects_invalid_format() -> None:
    """格式校验在 DTO 层完成；非法字符直接 422。"""
    with _build_client(change_username_use_case=StubChangeAgentUsernameUseCase()) as client:
        response = client.patch(
            "/api/v1/agent-auth/me/username",
            json={"new_username": "Bad Name!"},
            headers={"Authorization": "Bearer stub-token"},
        )

    assert response.status_code == 422


def test_agent_auth_router_handles_wechat_callback() -> None:
    callback_use_case = StubHandleWechatCallbackUseCase()
    with _build_client(callback_use_case=callback_use_case, gateway=StubWechatGateway()) as client:
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
    assert len(callback_use_case.commands) == 1
