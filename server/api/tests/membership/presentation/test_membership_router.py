from __future__ import annotations

from datetime import UTC, datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.membership.application import (
    CreateMembershipOrderResult,
    GetMembershipOrderResult,
    HandleWechatPayNotifyResult,
)
from mz_ai_backend.modules.membership.application.dtos import WechatPayPaymentParams
from mz_ai_backend.modules.membership.domain import MembershipOrderStatus, MembershipTier
from mz_ai_backend.modules.membership.infrastructure.dependencies import (
    get_create_membership_order_use_case,
    get_get_membership_order_use_case,
    get_handle_wechat_pay_notify_use_case,
)


class StubCreateMembershipOrderUseCase:
    async def execute(self, command) -> CreateMembershipOrderResult:
        assert command.identity.openid == "openid-10001"
        assert command.tier == MembershipTier.NORMAL
        return CreateMembershipOrderResult(
            order_no="50001",
            tier=MembershipTier.NORMAL,
            amount_fen=10,
            status=MembershipOrderStatus.PENDING,
            payment_params=WechatPayPaymentParams(
                time_stamp="123456",
                nonce_str="nonce-1",
                package="prepay_id=wx-prepay-01",
                sign_type="RSA",
                pay_sign="signature",
            ),
        )


class StubGetMembershipOrderUseCase:
    async def execute(self, query) -> GetMembershipOrderResult:
        assert query.order_no == "50001"
        assert query.identity.openid == "openid-10001"
        return GetMembershipOrderResult(
            order_no="50001",
            tier=MembershipTier.NORMAL,
            amount_fen=10,
            status=MembershipOrderStatus.PAID,
            membership_applied=True,
            membership_started_at=datetime.now(UTC).replace(tzinfo=None),
            membership_expires_at=datetime.now(UTC).replace(tzinfo=None),
        )


class StubHandleWechatPayNotifyUseCase:
    async def execute(self, command) -> HandleWechatPayNotifyResult:
        assert command.headers.get("wechatpay-signature") == "signature"
        assert command.body == b'{"id":"notify-id"}'
        return HandleWechatPayNotifyResult(
            order_no="50001",
            status=MembershipOrderStatus.PAID,
        )


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_create_membership_order_use_case] = (
        StubCreateMembershipOrderUseCase
    )
    app.dependency_overrides[get_get_membership_order_use_case] = StubGetMembershipOrderUseCase
    app.dependency_overrides[get_handle_wechat_pay_notify_use_case] = (
        StubHandleWechatPayNotifyUseCase
    )
    return TestClient(app, raise_server_exceptions=False)


def test_membership_router_creates_order() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/memberships/wechat-mini-program/orders",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
                "X-Request-Id": "membership-create-request",
            },
            json={"tier": "normal"},
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "membership-create-request"
    assert body["data"]["order_no"] == "50001"
    assert body["data"]["amount_fen"] == 10
    assert body["data"]["payment_params"]["package"] == "prepay_id=wx-prepay-01"


def test_membership_router_gets_order() -> None:
    with _build_client() as client:
        response = client.get(
            "/api/v1/memberships/wechat-mini-program/orders/50001",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
                "X-Request-Id": "membership-get-request",
            },
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "membership-get-request"
    assert body["data"]["order_no"] == "50001"
    assert body["data"]["status"] == "paid"
    assert body["data"]["membership_applied"] is True


def test_membership_router_handles_wechat_pay_notify() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/memberships/wechat-pay/notify",
            headers={
                "wechatpay-signature": "signature",
                "content-type": "application/json",
            },
            data=b'{"id":"notify-id"}',
        )

    body = response.json()
    assert response.status_code == 200
    assert body["code"] == "SUCCESS"
    assert body["message"] == "success"
