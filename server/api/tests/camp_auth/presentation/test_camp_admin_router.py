from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.core.config import get_settings
from mz_ai_backend.modules.admin_auth.application import AdminIdentity
from mz_ai_backend.modules.admin_auth.infrastructure.dependencies import require_admin
from mz_ai_backend.modules.camp_auth.application.admin_dtos import (
    CampAccountAdminPage,
    CampAccountAdminView,
)
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_delete_camp_account_use_case,
    get_get_camp_account_use_case,
    get_list_camp_accounts_use_case,
    get_update_camp_account_membership_use_case,
    get_update_camp_account_status_use_case,
)


@pytest.fixture(autouse=True)
def _configure_admin_token_secret(monkeypatch: pytest.MonkeyPatch) -> None:
    # 本地 .env 未配置管理端密钥（管理端默认未启用），但 require_admin 的 401 校验
    # 发生在密钥校验之前；为让「未覆盖 require_admin 且不带令牌 → 401」这一断言
    # 命中真实的未鉴权分支而非「密钥未配置」的 500 分支，测试范围内显式配置密钥。
    monkeypatch.setenv("MZ_AI_BACKEND_ADMIN_TOKEN_SECRET", "test-admin-token-secret")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _view(account_id: int = 5001, **ov) -> CampAccountAdminView:
    base = dict(
        account_id=account_id,
        username=f"camp_{account_id}",
        email="u@example.com",
        status=CampAccountStatus.ACTIVE,
        membership_tier="none",
        membership_started_at=None,
        membership_expires_at=None,
        is_deleted=False,
        created_at=_now(),
        updated_at=_now(),
    )
    base.update(ov)
    return CampAccountAdminView(**base)


class _StubList:
    async def execute(self, query):
        return CampAccountAdminPage(items=[_view()], total=1, page=query.page, page_size=query.page_size)


class _StubGet:
    async def execute(self, query):
        return _view(account_id=query.account_id)


class _StubStatus:
    async def execute(self, command):
        return _view(account_id=command.account_id, status=command.status)


class _StubMembership:
    async def execute(self, command):
        return _view(
            account_id=command.account_id,
            membership_tier=command.tier,
            membership_expires_at=command.expires_at,
        )


class _StubDelete:
    async def execute(self, command):
        return None


def _build_client(*, authorized: bool = True) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_list_camp_accounts_use_case] = lambda: _StubList()
    app.dependency_overrides[get_get_camp_account_use_case] = lambda: _StubGet()
    app.dependency_overrides[get_update_camp_account_status_use_case] = lambda: _StubStatus()
    app.dependency_overrides[get_update_camp_account_membership_use_case] = lambda: _StubMembership()
    app.dependency_overrides[get_delete_camp_account_use_case] = lambda: _StubDelete()
    if authorized:
        app.dependency_overrides[require_admin] = lambda: AdminIdentity(username="root")
    return TestClient(app, raise_server_exceptions=False)


def test_list_requires_admin() -> None:
    # 未覆盖 require_admin 且不带令牌 → 401
    with _build_client(authorized=False) as client:
        response = client.get("/api/v1/admin/camp-accounts")
    assert response.status_code == 401


def test_list_returns_page() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/admin/camp-accounts?page=1&page_size=20")
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["total"] == 1
    assert body["data"]["items"][0]["account_id"] == "5001"


def test_update_status() -> None:
    with _build_client() as client:
        response = client.patch(
            "/api/v1/admin/camp-accounts/5001/status", json={"status": "disabled"}
        )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "disabled"


def test_update_membership() -> None:
    expires = (datetime.now(UTC) + timedelta(days=30)).isoformat()
    with _build_client() as client:
        response = client.patch(
            "/api/v1/admin/camp-accounts/5001/membership",
            json={"tier": "premium", "expires_at": expires},
        )
    assert response.status_code == 200
    assert response.json()["data"]["membership_tier"] == "premium"


def test_delete_account() -> None:
    with _build_client() as client:
        response = client.delete("/api/v1/admin/camp-accounts/5001")
    assert response.status_code == 200
    assert response.json()["data"]["deleted"] is True
