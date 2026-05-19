from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.account_membership.domain import (
    AccountMembershipSnapshot,
    MembershipTier,
)
from mz_ai_backend.modules.account_membership.infrastructure.dependencies import (
    get_current_account_id,
    get_get_my_membership_use_case,
)


class MyMembershipUseCase:
    async def execute(self, query) -> AccountMembershipSnapshot:
        assert query.account_id == 2001
        return AccountMembershipSnapshot(
            account_id=2001,
            tier=MembershipTier.NORMAL,
            started_at=datetime(2026, 5, 18, 10, 0, 0),
            expires_at=datetime(2027, 5, 18, 10, 0, 0),
            is_active=True,
            remaining_days=365,
        )


def test_my_membership_returns_authorized_schema() -> None:
    app = create_app()
    app.dependency_overrides[get_current_account_id] = lambda: 2001
    app.dependency_overrides[get_get_my_membership_use_case] = lambda: MyMembershipUseCase()

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/account-membership/me")

    body = response.json()
    assert response.status_code == 200
    assert body["data"] == {
        "tier": "normal",
        "started_at": "2026-05-18T10:00:00",
        "expires_at": "2027-05-18T10:00:00",
        "is_active": True,
        "remaining_days": 365,
    }


def test_my_membership_requires_authorization() -> None:
    app = create_app()

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/v1/account-membership/me")

    body = response.json()
    assert response.status_code == 401
    assert body["code"] == "AGENT_AUTH.ACCESS_TOKEN_EXPIRED"
