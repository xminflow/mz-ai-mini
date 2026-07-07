from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from mz_ai_backend.core.exceptions import UnauthorizedException
from mz_ai_backend.modules.admin_auth.application import (
    AdminLoginCommand,
    AdminTokenResult,
)
from mz_ai_backend.modules.admin_auth.application.use_cases import AdminLoginUseCase


class _StubVerifier:
    def __init__(self, *, ok: bool) -> None:
        self._ok = ok

    def verify(self, *, username: str, password: str) -> bool:
        return self._ok


class _StubTokenService:
    def issue(self, *, username: str, now: datetime, ttl_minutes: int) -> AdminTokenResult:
        assert username == "root"
        assert ttl_minutes == 720
        return AdminTokenResult(token="issued-token", expires_at=now + timedelta(minutes=ttl_minutes))

    def verify(self, *, token: str, now: datetime):  # pragma: no cover - unused here
        raise NotImplementedError


@pytest.mark.asyncio
async def test_login_success_returns_token() -> None:
    use_case = AdminLoginUseCase(
        credential_verifier=_StubVerifier(ok=True),
        token_service=_StubTokenService(),
        token_ttl_minutes=720,
    )
    result = await use_case.execute(AdminLoginCommand(username="root", password="pw"))
    assert result.token == "issued-token"


@pytest.mark.asyncio
async def test_login_failure_raises_unauthorized() -> None:
    use_case = AdminLoginUseCase(
        credential_verifier=_StubVerifier(ok=False),
        token_service=_StubTokenService(),
        token_ttl_minutes=720,
    )
    with pytest.raises(UnauthorizedException):
        await use_case.execute(AdminLoginCommand(username="root", password="bad"))
