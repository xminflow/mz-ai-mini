from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.camp_membership.application import (
    CampMembershipOrderStatusResult,
    CreateCampMembershipOrderResult,
)
from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSnapshot,
    CampMembershipSku,
    CampMembershipTier,
    CampOrderStatus,
)
from mz_ai_backend.modules.camp_membership.infrastructure.dependencies import (
    get_create_camp_membership_order_use_case,
    get_current_camp_account_id,
    get_get_camp_order_status_use_case,
    get_get_my_camp_membership_use_case,
    get_handle_camp_wechat_pay_notify_use_case,
)


class CreateUseCase:
    async def execute(self, command) -> CreateCampMembershipOrderResult:
        assert command.account_id == 3001
        assert command.sku == CampMembershipSku.ANNUAL_BASIC
        return CreateCampMembershipOrderResult(
            order_no="CAMP1",
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PENDING,
            code_url="weixin://wxpay/native",
            qr_expires_at=datetime(2026, 6, 12, 10, 15, 0),
        )


class StatusUseCase:
    async def execute(self, query) -> CampMembershipOrderStatusResult:
        assert query.account_id == 3001
        assert query.order_no == "CAMP1"
        return CampMembershipOrderStatusResult(
            order_no="CAMP1",
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PAID,
            code_url=None,
            paid_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_applied=True,
            membership_started_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_expires_at=datetime(2027, 6, 12, 10, 0, 0),
        )


class MyMembershipUseCase:
    async def execute(self, query) -> CampMembershipSnapshot:
        assert query.account_id == 3001
        return CampMembershipSnapshot(
            account_id=3001,
            tier=CampMembershipTier.BASIC,
            started_at=datetime(2026, 6, 12, 10, 0, 0),
            expires_at=datetime(2027, 6, 12, 10, 0, 0),
            is_active=True,
            remaining_days=365,
        )


class NotifyUseCase:
    async def execute(self, command) -> CampMembershipOrderStatusResult:
        assert command.headers.get("wechatpay-signature") == "signature"
        assert command.body == b'{"id":"notify"}'
        return CampMembershipOrderStatusResult(
            order_no="CAMP1",
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PAID,
            code_url=None,
            paid_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_applied=True,
            membership_started_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_expires_at=datetime(2027, 6, 12, 10, 0, 0),
        )


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_current_camp_account_id] = lambda: 3001
    app.dependency_overrides[get_create_camp_membership_order_use_case] = lambda: CreateUseCase()
    app.dependency_overrides[get_get_camp_order_status_use_case] = lambda: StatusUseCase()
    app.dependency_overrides[get_get_my_camp_membership_use_case] = lambda: MyMembershipUseCase()
    app.dependency_overrides[get_handle_camp_wechat_pay_notify_use_case] = lambda: NotifyUseCase()
    return TestClient(app, raise_server_exceptions=False)


def test_camp_membership_router_creates_order() -> None:
    with _build_client() as client:
        response = client.post("/api/v1/camp-membership/orders", json={"sku": "annual_basic"})
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["order_no"] == "CAMP1"
    assert body["data"]["code_url"] == "weixin://wxpay/native"


def test_camp_membership_router_gets_order_status() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/camp-membership/orders/CAMP1")
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["status"] == "paid"
    assert body["data"]["membership_applied"] is True


def test_camp_membership_router_gets_my_membership() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/camp-membership/me")
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["tier"] == "basic"
    assert body["data"]["remaining_days"] == 365


def test_camp_membership_router_handles_wechat_pay_notify() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/camp-membership/wechat-pay/notify",
            headers={"wechatpay-signature": "signature"},
            content=b'{"id":"notify"}',
        )
    assert response.status_code == 200
    assert response.json() == {"code": "SUCCESS", "message": "success"}
