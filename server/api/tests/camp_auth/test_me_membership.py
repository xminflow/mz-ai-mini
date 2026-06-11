from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.camp_auth.application import CampAccountSummary
from mz_ai_backend.modules.camp_auth.application.dtos import CampMembershipSummary
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_current_camp_access_token,
    get_get_current_camp_account_use_case,
)


class FakeUseCase:
    async def execute(self, query) -> CampAccountSummary:
        return CampAccountSummary(
            account_id=3001,
            username="camper",
            email=None,
            status=CampAccountStatus.ACTIVE,
            created_at=datetime(2026, 1, 1),
            membership=CampMembershipSummary(
                tier="basic",
                is_active=True,
                expires_at=datetime(2027, 1, 1),
                remaining_days=203,
            ),
        )


def _client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_current_camp_access_token] = lambda: "tok"
    app.dependency_overrides[get_get_current_camp_account_use_case] = lambda: FakeUseCase()
    return TestClient(app, raise_server_exceptions=False)


def test_camp_me_returns_membership() -> None:
    with _client() as client:
        response = client.get("/api/v1/camp-auth/me", headers={"Authorization": "Bearer tok"})
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["membership"]["tier"] == "basic"
    assert body["data"]["membership"]["is_active"] is True
    assert body["data"]["membership"]["remaining_days"] == 203
