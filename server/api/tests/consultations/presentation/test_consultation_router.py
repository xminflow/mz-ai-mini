from __future__ import annotations

from datetime import UTC, datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.consultations.application import (
    CreateConsultationRequestResult,
)
from mz_ai_backend.modules.consultations.infrastructure import (
    get_create_consultation_request_use_case,
)


class StubCreateConsultationRequestUseCase:
    async def execute(self, command) -> CreateConsultationRequestResult:
        assert command.identity.openid == "openid-10001"
        assert command.phone == "13800138000"
        assert command.email == "owner@example.com"
        assert command.business_type == "other"
        assert command.business_type_other == "门店巡检"
        assert command.business_description == "希望通过 AI 提升门店运营效率。"
        return CreateConsultationRequestResult(
            consultation_id=182758122237067264,
            submitted_at=datetime.now(UTC).replace(tzinfo=None),
        )


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_create_consultation_request_use_case] = (
        StubCreateConsultationRequestUseCase
    )
    return TestClient(app, raise_server_exceptions=False)


def test_consultation_router_creates_request() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/consultations/wechat-mini-program/requests",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
                "X-Request-Id": "consultation-request",
            },
            json={
                "phone": "13800138000",
                "email": "owner@example.com",
                "business_type": "other",
                "business_type_other": "门店巡检",
                "business_description": "希望通过 AI 提升门店运营效率。",
            },
        )

    body = response.json()
    assert response.status_code == 200
    assert body["request_id"] == "consultation-request"
    assert body["data"]["consultation_id"] == "182758122237067264"
    assert body["data"]["submitted_at"] is not None


def test_consultation_router_rejects_invalid_email() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/consultations/wechat-mini-program/requests",
            headers={
                "X-WX-OPENID": "openid-10001",
                "X-WX-APPID": "wx-app-id",
            },
            json={
                "phone": "13800138000",
                "email": "invalid-email",
                "business_type": "marketing_growth",
                "business_description": "希望提升营销转化。",
            },
        )

    body = response.json()
    assert response.status_code == 422
    assert body["code"] == "COMMON.VALIDATION_ERROR"


def test_consultation_router_requires_cloud_identity() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/consultations/wechat-mini-program/requests",
            json={
                "phone": "13800138000",
                "email": "owner@example.com",
                "business_type": "marketing_growth",
                "business_description": "希望提升营销转化。",
            },
        )

    body = response.json()
    assert response.status_code == 401
    assert body["code"] == "AUTH.CLOUD_IDENTITY_MISSING"
