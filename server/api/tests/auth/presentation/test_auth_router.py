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
from mz_ai_backend.modules.auth.presentation.router import get_avatar_storage_client

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
        expected_profile: dict[str, str | None] | None = None,
    ) -> None:
        self._result = result
        self._error = error
        self._expected_profile = expected_profile or {}

    async def execute(self, command) -> UpdateCurrentMiniProgramUserProfileResult:
        assert command.identity.openid == "openid-10001"
        assert command.profile.nickname == self._expected_profile.get("nickname")
        assert command.profile.avatar_url == self._expected_profile.get("avatar_url")
        if self._error is not None:
            raise self._error
        assert self._result is not None
        return self._result


class StubAvatarStorageClient:
    def __init__(self) -> None:
        self.uploaded_payloads: list[dict[str, object]] = []

    def upload_bytes(
        self,
        *,
        content: bytes,
        object_key: str,
        content_type: str,
    ) -> str:
        self.uploaded_payloads.append(
            {
                "content": content,
                "object_key": object_key,
                "content_type": content_type,
            }
        )
        return "https://weelume-pro.example.com/avatars/avatar.png"


def _build_client(
    use_case: StubEnsureCurrentMiniProgramUserUseCase | None = None,
    profile_use_case: StubUpdateCurrentMiniProgramUserProfileUseCase | None = None,
    avatar_storage_client: StubAvatarStorageClient | None = None,
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
    if avatar_storage_client is not None:
        app.dependency_overrides[get_avatar_storage_client] = (
            lambda: avatar_storage_client
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
        expected_profile={
            "avatar_url": "cloud://env-id.bucket/avatars/avatar.png",
        },
        result=UpdateCurrentMiniProgramUserProfileResult(
            user=AuthenticatedUserSummary(
                user_id=USER_ID,
                openid="openid-10001",
                union_id="union-10001",
                nickname="妙智学员",
                avatar_url="cloud://env-id.bucket/avatars/avatar.png",
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
                "avatar_url": "cloud://env-id.bucket/avatars/avatar.png",
            },
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "auth-profile-request"
    assert body["data"]["user"]["user_id"] == str(USER_ID)
    assert body["data"]["user"]["nickname"] == "妙智学员"
    assert body["data"]["user"]["avatar_url"] == "cloud://env-id.bucket/avatars/avatar.png"


def test_auth_router_rejects_empty_profile_patch() -> None:
    with _build_client() as client:
        response = client.put(
            "/api/v1/auth/wechat-mini-program/users/current/profile",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
            },
            json={},
        )

    body = response.json()
    assert response.status_code == 422
    assert body["code"] == "COMMON.VALIDATION_ERROR"


def test_auth_router_rejects_profile_update_when_cloud_identity_is_missing() -> None:
    with _build_client() as client:
        response = client.put(
            "/api/v1/auth/wechat-mini-program/users/current/profile",
            json={
                "nickname": "妙智学员",
                "avatar_url": "cloud://env-id.bucket/avatars/avatar.png",
            },
        )

    body = response.json()
    assert response.status_code == 401
    assert body["code"] == "AUTH.CLOUD_IDENTITY_MISSING"
    assert body["data"] is None


def test_auth_router_uploads_current_mini_program_user_avatar() -> None:
    avatar_storage_client = StubAvatarStorageClient()

    with _build_client(avatar_storage_client=avatar_storage_client) as client:
        response = client.post(
            "/api/v1/auth/wechat-mini-program/users/current/avatar",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
                "X-Request-Id": "auth-avatar-request",
            },
            json={
                "object_key": "avatars/avatar.png",
                "content_type": "image/png",
                "content_base64": "cG5n",
            },
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "auth-avatar-request"
    assert body["data"]["avatar_url"] == (
        "https://weelume-pro.example.com/avatars/avatar.png"
    )
    assert avatar_storage_client.uploaded_payloads == [
        {
            "content": b"png",
            "object_key": "avatars/avatar.png",
            "content_type": "image/png",
        }
    ]


def test_auth_router_rejects_avatar_upload_outside_avatar_directory() -> None:
    with _build_client(avatar_storage_client=StubAvatarStorageClient()) as client:
        response = client.post(
            "/api/v1/auth/wechat-mini-program/users/current/avatar",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
            },
            json={
                "object_key": "../avatar.png",
                "content_type": "image/png",
                "content_base64": "cG5n",
            },
        )

    body = response.json()
    assert response.status_code == 422
    assert body["code"] == "COMMON.VALIDATION_ERROR"


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
