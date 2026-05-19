from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.account_membership.application import (
    CreateMembershipOrderResult,
    MembershipOrderStatusResult,
)
from mz_ai_backend.modules.account_membership.domain import AccountMembershipSnapshot, MembershipSku, MembershipTier, OrderStatus
from mz_ai_backend.modules.account_membership.infrastructure.dependencies import (
    get_create_membership_order_use_case,
    get_current_account_id,
    get_get_my_membership_use_case,
    get_get_order_status_use_case,
    get_handle_wechat_pay_notify_use_case,
)


class CreateUseCase:
    async def execute(self, command) -> CreateMembershipOrderResult:
        assert command.account_id == 2001
        assert command.sku == MembershipSku.ANNUAL_NORMAL
        return CreateMembershipOrderResult(
            order_no="WEB1",
            sku=MembershipSku.ANNUAL_NORMAL,
            amount_fen=50000,
            status=OrderStatus.PENDING,
            code_url="weixin://wxpay/native",
            qr_expires_at=datetime(2026, 5, 18, 10, 15, 0),
        )


class StatusUseCase:
    async def execute(self, query) -> MembershipOrderStatusResult:
        assert query.account_id == 2001
        assert query.order_no == "WEB1"
        return MembershipOrderStatusResult(
            order_no="WEB1",
            sku=MembershipSku.ANNUAL_NORMAL,
            amount_fen=50000,
            status=OrderStatus.PAID,
            code_url=None,
            paid_at=datetime(2026, 5, 18, 10, 0, 0),
            membership_applied=True,
            membership_started_at=datetime(2026, 5, 18, 10, 0, 0),
            membership_expires_at=datetime(2027, 5, 18, 10, 0, 0),
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


class NotifyUseCase:
    async def execute(self, command) -> MembershipOrderStatusResult:
        assert command.headers.get("wechatpay-signature") == "signature"
        assert command.body == b'{"id":"notify"}'
        return MembershipOrderStatusResult(
            order_no="WEB1",
            sku=MembershipSku.ANNUAL_NORMAL,
            amount_fen=50000,
            status=OrderStatus.PAID,
            code_url=None,
            paid_at=datetime(2026, 5, 18, 10, 0, 0),
            membership_applied=True,
            membership_started_at=datetime(2026, 5, 18, 10, 0, 0),
            membership_expires_at=datetime(2027, 5, 18, 10, 0, 0),
        )


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_current_account_id] = lambda: 2001
    app.dependency_overrides[get_create_membership_order_use_case] = lambda: CreateUseCase()
    app.dependency_overrides[get_get_order_status_use_case] = lambda: StatusUseCase()
    app.dependency_overrides[get_get_my_membership_use_case] = lambda: MyMembershipUseCase()
    app.dependency_overrides[get_handle_wechat_pay_notify_use_case] = lambda: NotifyUseCase()
    return TestClient(app, raise_server_exceptions=False)


def test_account_membership_router_creates_order() -> None:
    with _build_client() as client:
        response = client.post("/api/v1/account-membership/orders", json={"sku": "annual_normal"})

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["order_no"] == "WEB1"
    assert body["data"]["code_url"] == "weixin://wxpay/native"


def test_account_membership_router_gets_order_status() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/account-membership/orders/WEB1")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["status"] == "paid"
    assert body["data"]["membership_applied"] is True


def test_account_membership_router_gets_my_membership() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/account-membership/me")

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["tier"] == "normal"
    assert body["data"]["remaining_days"] == 365


def test_account_membership_router_handles_wechat_pay_notify() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/account-membership/wechat-pay/notify",
            headers={"wechatpay-signature": "signature"},
            content=b'{"id":"notify"}',
        )

    assert response.status_code == 200
    assert response.json() == {"code": "SUCCESS", "message": "success"}
