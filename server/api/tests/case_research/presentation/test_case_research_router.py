from __future__ import annotations

from datetime import UTC, datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.case_research.application import (
    CreateCaseResearchOrderResult,
    CreatePublicCaseResearchRequestResult,
    GetCaseResearchOrderResult,
    ListUserCaseResearchRequestsResult,
)
from mz_ai_backend.modules.case_research.domain import (
    CaseResearchOrderStatus,
    CaseResearchRequestStatus,
    CaseResearchVisibility,
)
from mz_ai_backend.modules.case_research.infrastructure import (
    get_create_order_use_case,
    get_create_public_request_use_case,
    get_get_order_use_case,
    get_list_requests_use_case,
)
from mz_ai_backend.shared.wechat_pay import WechatPayPaymentParams

_HEADERS = {
    "X-WX-OPENID": "openid-10001",
    "X-WX-APPID": "wx-app-id",
    "X-Request-Id": "test-request",
}

_PAYLOAD = {
    "title": "示范科技公司案例调研",
    "description": "主要从事 AI 赋能企业数字化转型业务。",
}

_NOW = datetime.now(UTC).replace(tzinfo=None)


class StubCreatePublicRequestUseCase:
    async def execute(self, command) -> CreatePublicCaseResearchRequestResult:
        return CreatePublicCaseResearchRequestResult(
            request_id=182758122237067264,
            visibility=CaseResearchVisibility.PUBLIC,
            status=CaseResearchRequestStatus.PENDING_REVIEW,
            created_at=_NOW,
        )


class StubCreateOrderUseCase:
    async def execute(self, command) -> CreateCaseResearchOrderResult:
        return CreateCaseResearchOrderResult(
            order_no="182758122237067264",
            amount_fen=10,
            status=CaseResearchOrderStatus.PENDING,
            payment_params=WechatPayPaymentParams(
                time_stamp="1700000000",
                nonce_str="abc123",
                package="prepay_id=wx_prepay",
                sign_type="RSA",
                pay_sign="signature",
            ),
        )


class StubGetOrderUseCase:
    async def execute(self, query) -> GetCaseResearchOrderResult:
        return GetCaseResearchOrderResult(
            order_no=query.order_no,
            amount_fen=10,
            status=CaseResearchOrderStatus.PAID,
            request_applied=True,
            request_id=999888777666,
        )


class StubListRequestsUseCase:
    async def execute(self, query) -> ListUserCaseResearchRequestsResult:
        return ListUserCaseResearchRequestsResult(items=[])


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_create_public_request_use_case] = StubCreatePublicRequestUseCase
    app.dependency_overrides[get_create_order_use_case] = StubCreateOrderUseCase
    app.dependency_overrides[get_get_order_use_case] = StubGetOrderUseCase
    app.dependency_overrides[get_list_requests_use_case] = StubListRequestsUseCase
    return TestClient(app, raise_server_exceptions=False)


def test_create_public_request_returns_201() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/case-research/wechat-mini-program/requests",
            headers=_HEADERS,
            json=_PAYLOAD,
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["request_id"] == "182758122237067264"
    assert body["data"]["visibility"] == "public"
    assert body["data"]["status"] == "pending_review"


def test_create_order_returns_payment_params() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/case-research/wechat-mini-program/orders",
            headers=_HEADERS,
            json=_PAYLOAD,
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["order_no"] == "182758122237067264"
    assert body["data"]["amount_fen"] == 10
    assert body["data"]["payment_params"]["time_stamp"] == "1700000000"


def test_get_order_returns_order_status() -> None:
    with _build_client() as client:
        response = client.get(
            "/api/v1/case-research/wechat-mini-program/orders/182758122237067264",
            headers=_HEADERS,
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["status"] == "paid"
    assert body["data"]["request_applied"] is True


def test_list_requests_returns_empty_list() -> None:
    with _build_client() as client:
        response = client.get(
            "/api/v1/case-research/wechat-mini-program/requests",
            headers=_HEADERS,
        )

    body = response.json()
    assert response.status_code == 200
    assert body["data"]["items"] == []


def test_create_public_request_rejects_empty_title() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/case-research/wechat-mini-program/requests",
            headers=_HEADERS,
            json={**_PAYLOAD, "title": ""},
        )

    assert response.status_code == 422


def test_create_public_request_rejects_empty_description() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/case-research/wechat-mini-program/requests",
            headers=_HEADERS,
            json={**_PAYLOAD, "description": ""},
        )

    assert response.status_code == 422
