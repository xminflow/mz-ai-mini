from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.admin_auth.application import AdminTokenResult
from mz_ai_backend.modules.admin_auth.infrastructure.dependencies import (
    get_admin_login_use_case,
    get_admin_token_service,
)


class _StubLoginUseCase:
    async def execute(self, command):
        assert command.username == "root"
        assert command.password == "pw"
        return AdminTokenResult(
            token="issued-token",
            expires_at=datetime.now(UTC) + timedelta(minutes=720),
        )


class _StubTokenService:
    def issue(self, *, username, now, ttl_minutes):  # pragma: no cover - unused
        raise NotImplementedError

    def verify(self, *, token, now):
        from mz_ai_backend.core.error_codes import ErrorCode
        from mz_ai_backend.core.exceptions import UnauthorizedException
        from mz_ai_backend.modules.admin_auth.application import AdminIdentity

        if token == "good-token":
            return AdminIdentity(username="root")
        raise UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED, message="Invalid admin token."
        )


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_admin_login_use_case] = lambda: _StubLoginUseCase()
    app.dependency_overrides[get_admin_token_service] = lambda: _StubTokenService()
    return TestClient(app, raise_server_exceptions=False)


def test_login_returns_token() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/admin/auth/login", json={"username": "root", "password": "pw"}
        )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == "COMMON.SUCCESS"
    assert body["data"]["token"] == "issued-token"


def test_me_requires_valid_bearer() -> None:
    with _build_client() as client:
        ok = client.get(
            "/api/v1/admin/auth/me", headers={"Authorization": "Bearer good-token"}
        )
        missing = client.get("/api/v1/admin/auth/me")
        bad = client.get(
            "/api/v1/admin/auth/me", headers={"Authorization": "Bearer bad-token"}
        )
    assert ok.status_code == 200
    assert ok.json()["data"]["username"] == "root"
    assert missing.status_code == 401
    assert bad.status_code == 401
