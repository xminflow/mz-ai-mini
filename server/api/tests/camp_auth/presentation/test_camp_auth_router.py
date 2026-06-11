from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.camp_auth.application import (
    CampAccountSummary,
    CampAuthenticationResult,
    CampTokenPair,
    CampWechatLoginSessionStatusResult,
    CreateCampWechatLoginSessionResult,
    LogoutCampSessionResult,
)
from mz_ai_backend.modules.camp_auth.application.dtos import CampWechatLoginSessionSummary
from mz_ai_backend.modules.camp_auth.domain import (
    CampAccountStatus,
    CampWechatLoginSessionStatus,
)
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_create_wechat_login_session_use_case,
    get_current_camp_access_token,
    get_exchange_wechat_login_use_case,
    get_get_current_camp_account_use_case,
    get_get_wechat_login_session_use_case,
    get_logout_camp_session_use_case,
    get_refresh_camp_session_use_case,
)


# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------

def _now() -> datetime:
    """返回无时区偏移的当前 UTC 时间（与数据层约定一致）。"""
    return datetime.now(UTC).replace(tzinfo=None)


def _make_account_summary(account_id: int = 2001, username: str = "camp_2001") -> CampAccountSummary:
    return CampAccountSummary(
        account_id=account_id,
        username=username,
        email=None,
        status=CampAccountStatus.ACTIVE,
        created_at=_now(),
    )


def _make_token_pair() -> CampTokenPair:
    # 使用带时区的 UTC 时间，保证序列化后带 "Z" 后缀（与 agent_auth 路由测试约定一致）
    now = datetime.now(UTC)
    return CampTokenPair(
        access_token="stub-access-token",
        access_token_expires_at=now + timedelta(minutes=30),
        refresh_token="stub-refresh-token",
        refresh_token_expires_at=now + timedelta(days=30),
    )


def _make_auth_result() -> CampAuthenticationResult:
    return CampAuthenticationResult(
        account=_make_account_summary(),
        tokens=_make_token_pair(),
    )


# ---------------------------------------------------------------------------
# Stub 用例
# ---------------------------------------------------------------------------

class StubCreateWechatLoginSessionUseCase:
    async def execute(self, _command):
        return CreateCampWechatLoginSessionResult(
            session=CampWechatLoginSessionSummary(
                login_session_id=3001,
                status=CampWechatLoginSessionStatus.PENDING,
                qr_code_url="https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=stub-ticket",
                expires_at=_now() + timedelta(minutes=5),
                poll_interval_ms=2000,
            )
        )


class StubGetWechatLoginSessionUseCase:
    async def execute(self, query):
        return CampWechatLoginSessionStatusResult(
            login_session_id=query.login_session_id,
            status=CampWechatLoginSessionStatus.AUTHENTICATED,
            expires_at=_now() + timedelta(minutes=3),
        )


class StubExchangeWechatLoginUseCase:
    async def execute(self, command):
        assert command.login_session_id == 3001
        return _make_auth_result()


class StubRefreshCampSessionUseCase:
    async def execute(self, command):
        assert command.refresh_token == "my-refresh-token"
        return _make_auth_result()


class StubLogoutCampSessionUseCase:
    async def execute(self, command):
        assert command.refresh_token == "my-refresh-token"
        return LogoutCampSessionResult(revoked=True)


class StubGetCurrentCampAccountUseCase:
    async def execute(self, query):
        assert query.access_token == "stub-bearer-token"
        return _make_account_summary()


# ---------------------------------------------------------------------------
# 客户端构建辅助
# ---------------------------------------------------------------------------

def _build_client(
    *,
    create_use_case: StubCreateWechatLoginSessionUseCase | None = None,
    status_use_case: StubGetWechatLoginSessionUseCase | None = None,
    exchange_use_case: StubExchangeWechatLoginUseCase | None = None,
    refresh_use_case: StubRefreshCampSessionUseCase | None = None,
    logout_use_case: StubLogoutCampSessionUseCase | None = None,
    me_use_case: StubGetCurrentCampAccountUseCase | None = None,
    override_bearer: bool = False,
) -> TestClient:
    app = create_app()
    if create_use_case is not None:
        app.dependency_overrides[get_create_wechat_login_session_use_case] = lambda: create_use_case
    if status_use_case is not None:
        app.dependency_overrides[get_get_wechat_login_session_use_case] = lambda: status_use_case
    if exchange_use_case is not None:
        app.dependency_overrides[get_exchange_wechat_login_use_case] = lambda: exchange_use_case
    if refresh_use_case is not None:
        app.dependency_overrides[get_refresh_camp_session_use_case] = lambda: refresh_use_case
    if logout_use_case is not None:
        app.dependency_overrides[get_logout_camp_session_use_case] = lambda: logout_use_case
    if me_use_case is not None:
        app.dependency_overrides[get_get_current_camp_account_use_case] = lambda: me_use_case
    if override_bearer:
        # 绕过 Bearer 解析，直接注入固定令牌，供 /me 路由测试使用
        app.dependency_overrides[get_current_camp_access_token] = lambda: "stub-bearer-token"
    return TestClient(app, raise_server_exceptions=False)


# ---------------------------------------------------------------------------
# 测试用例
# ---------------------------------------------------------------------------

def test_camp_auth_router_creates_wechat_login_session() -> None:
    """POST /camp-auth/wechat-official/login-sessions 返回 QR 登录会话。"""
    with _build_client(create_use_case=StubCreateWechatLoginSessionUseCase()) as client:
        response = client.post("/api/v1/camp-auth/wechat-official/login-sessions")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["login_session_id"] == "3001"
    assert body["data"]["status"] == "pending"
    assert "qr_code_url" in body["data"]
    assert body["data"]["poll_interval_ms"] == 2000


def test_camp_auth_router_reads_wechat_login_session_status() -> None:
    """GET /camp-auth/wechat-official/login-sessions/{id} 返回会话状态。"""
    with _build_client(status_use_case=StubGetWechatLoginSessionUseCase()) as client:
        response = client.get("/api/v1/camp-auth/wechat-official/login-sessions/3001")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["login_session_id"] == "3001"
    assert body["data"]["status"] == "authenticated"


def test_camp_auth_router_exchanges_wechat_login_session() -> None:
    """POST /camp-auth/wechat-official/login-sessions/{id}/exchange 返回令牌与账户。"""
    with _build_client(exchange_use_case=StubExchangeWechatLoginUseCase()) as client:
        response = client.post(
            "/api/v1/camp-auth/wechat-official/login-sessions/3001/exchange",
            json={},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["tokens"]["access_token"] == "stub-access-token"
    assert body["data"]["tokens"]["refresh_token"] == "stub-refresh-token"
    assert body["data"]["tokens"]["access_token_expires_at"].endswith("Z")
    assert body["data"]["tokens"]["refresh_token_expires_at"].endswith("Z")
    assert body["data"]["account"]["account_id"] == "2001"
    assert body["data"]["account"]["username"] == "camp_2001"
    assert body["data"]["account"]["status"] == "active"


def test_camp_auth_router_refreshes_session() -> None:
    """POST /camp-auth/refresh 轮换刷新令牌并返回新令牌对。"""
    with _build_client(refresh_use_case=StubRefreshCampSessionUseCase()) as client:
        response = client.post(
            "/api/v1/camp-auth/refresh",
            json={"refresh_token": "my-refresh-token"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["tokens"]["access_token"] == "stub-access-token"
    assert body["data"]["account"]["username"] == "camp_2001"


def test_camp_auth_router_logout_revokes_session() -> None:
    """POST /camp-auth/logout 撤销刷新令牌并返回 revoked=true。"""
    with _build_client(logout_use_case=StubLogoutCampSessionUseCase()) as client:
        response = client.post(
            "/api/v1/camp-auth/logout",
            json={"refresh_token": "my-refresh-token"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["revoked"] is True


def test_camp_auth_router_me_returns_current_account() -> None:
    """GET /camp-auth/me 通过 Bearer 令牌返回当前账户信息。"""
    with _build_client(
        me_use_case=StubGetCurrentCampAccountUseCase(),
        override_bearer=True,
    ) as client:
        response = client.get(
            "/api/v1/camp-auth/me",
            headers={"Authorization": "Bearer stub-bearer-token"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["account_id"] == "2001"
    assert body["data"]["username"] == "camp_2001"
    assert body["data"]["status"] == "active"
