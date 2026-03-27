from __future__ import annotations

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.auth.application import (
    AuthenticatedUserSummary,
    EnsureCurrentMiniProgramUserResult,
    UpdateCurrentMiniProgramUserProfileResult,
)
from mz_ai_backend.modules.auth.domain import (
    CloudIdentityMissingException,
    UserStatus,
)
from mz_ai_backend.modules.auth.infrastructure.dependencies import (
    get_ensure_current_mini_program_user_use_case,
    get_update_current_mini_program_user_profile_use_case,
)

USER_ID = 162758122237067264


class StubEnsureCurrentMiniProgramUserUseCase:
    def __init__(
        self,
        *,
        result: EnsureCurrentMiniProgramUserResult | None = None,
        error: Exception | None = None,
    ) -> None:
        self._result = result
        self._error = error

    async def execute(self, command) -> EnsureCurrentMiniProgramUserResult:
        assert command.identity.openid == "openid-10001"
        if self._error is not None:
            raise self._error
        assert self._result is not None
        return self._result


class StubUpdateCurrentMiniProgramUserProfileUseCase:
    def __init__(
        self,
        *,
        result: UpdateCurrentMiniProgramUserProfileResult | None = None,
        error: Exception | None = None,
    ) -> None:
        self._result = result
        self._error = error

    async def execute(self, command) -> UpdateCurrentMiniProgramUserProfileResult:
        assert command.identity.openid == "openid-10001"
        assert command.profile.nickname == "妙智学员"
        assert command.profile.avatar_url == "https://example.com/avatar.png"
        if self._error is not None:
            raise self._error
        assert self._result is not None
        return self._result


def _build_client(
    use_case: StubEnsureCurrentMiniProgramUserUseCase | None = None,
    profile_use_case: StubUpdateCurrentMiniProgramUserProfileUseCase | None = None,
) -> TestClient:
    app = create_app()
    if use_case is not None:
        app.dependency_overrides[get_ensure_current_mini_program_user_use_case] = (
            lambda: use_case
        )
    if profile_use_case is not None:
        app.dependency_overrides[get_update_current_mini_program_user_profile_use_case] = (
            lambda: profile_use_case
        )
    return TestClient(app, raise_server_exceptions=False)


def test_auth_router_syncs_current_mini_program_user() -> None:
    use_case = StubEnsureCurrentMiniProgramUserUseCase(
        result=EnsureCurrentMiniProgramUserResult(
            is_new_user=True,
            user=AuthenticatedUserSummary(
                user_id=USER_ID,
                openid="openid-10001",
                union_id=None,
                nickname=None,
                avatar_url=None,
                status=UserStatus.ACTIVE,
            ),
        )
    )

    with _build_client(use_case) as client:
        response = client.put(
            "/api/v1/auth/wechat-mini-program/users/current",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
                "X-Request-Id": "auth-request",
            },
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "auth-request"
    assert body["data"]["is_new_user"] is True
    assert body["data"]["user"]["user_id"] == str(USER_ID)
    assert body["data"]["user"]["openid"] == "openid-10001"
    assert body["data"]["user"]["nickname"] is None
    assert body["data"]["user"]["avatar_url"] is None


def test_auth_router_returns_standard_error_when_cloud_identity_is_missing() -> None:
    with _build_client() as client:
        response = client.put("/api/v1/auth/wechat-mini-program/users/current")

    body = response.json()
    assert response.status_code == 401
    assert body["code"] == "AUTH.CLOUD_IDENTITY_MISSING"


def test_auth_router_updates_current_mini_program_user_profile() -> None:
    profile_use_case = StubUpdateCurrentMiniProgramUserProfileUseCase(
        result=UpdateCurrentMiniProgramUserProfileResult(
            user=AuthenticatedUserSummary(
                user_id=USER_ID,
                openid="openid-10001",
                union_id="union-10001",
                nickname="妙智学员",
                avatar_url="https://example.com/avatar.png",
                status=UserStatus.ACTIVE,
            )
        )
    )

    with _build_client(profile_use_case=profile_use_case) as client:
        response = client.put(
            "/api/v1/auth/wechat-mini-program/users/current/profile",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
                "X-Request-Id": "auth-profile-request",
            },
            json={
                "nickname": "妙智学员",
                "avatar_url": "https://example.com/avatar.png",
            },
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "auth-profile-request"
    assert body["data"]["user"]["user_id"] == str(USER_ID)
    assert body["data"]["user"]["nickname"] == "妙智学员"
    assert body["data"]["user"]["avatar_url"] == "https://example.com/avatar.png"


def test_auth_router_rejects_profile_update_when_cloud_identity_is_missing() -> None:
    with _build_client() as client:
        response = client.put(
            "/api/v1/auth/wechat-mini-program/users/current/profile",
            json={
                "nickname": "妙智学员",
                "avatar_url": "https://example.com/avatar.png",
            },
        )

    body = response.json()
    assert response.status_code == 401
    assert body["code"] == "AUTH.CLOUD_IDENTITY_MISSING"
    assert body["data"] is None


def test_auth_router_propagates_domain_errors() -> None:
    use_case = StubEnsureCurrentMiniProgramUserUseCase(
        error=CloudIdentityMissingException()
    )

    with _build_client(use_case) as client:
        response = client.put(
            "/api/v1/auth/wechat-mini-program/users/current",
            headers={"X-WX-OPENID": "openid-10001"},
        )

    body = response.json()
    assert response.status_code == 401
    assert body["code"] == "AUTH.CLOUD_IDENTITY_MISSING"
