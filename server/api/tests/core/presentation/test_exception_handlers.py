from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.core import BusinessException, ErrorCode


def _build_test_client() -> TestClient:
    app: FastAPI = create_app()

    @app.get("/api/v1/test/items/{item_id}")
    def get_item(item_id: int) -> dict[str, int]:
        return {"item_id": item_id}

    @app.get("/api/v1/test/business")
    def raise_business_exception() -> None:
        raise BusinessException(message="Business rule violated.")

    @app.get("/api/v1/test/crash")
    def raise_runtime_error() -> None:
        raise RuntimeError("boom")

    return TestClient(app, raise_server_exceptions=False)


def test_validation_error_returns_standard_envelope() -> None:
    with _build_test_client() as client:
        response = client.get("/api/v1/test/items/not-an-int")

    body = response.json()
    assert response.status_code == 422
    assert response.headers["X-Request-Id"] == body["request_id"]
    assert body["code"] == ErrorCode.COMMON_VALIDATION_ERROR.value
    assert body["data"] is None
    assert "item_id" in body["message"]


def test_business_exception_logs_context_and_returns_standard_envelope(caplog) -> None:
    caplog.set_level(logging.INFO)

    with _build_test_client() as client:
        response = client.get(
            "/api/v1/test/business",
            headers={"X-Request-Id": "req-business"},
        )

    body = response.json()
    assert response.status_code == 400
    assert response.headers["X-Request-Id"] == "req-business"
    assert body["request_id"] == "req-business"
    assert body["code"] == ErrorCode.COMMON_BUSINESS_ERROR.value
    assert body["message"] == "Business rule violated."

    error_records = [
        record
        for record in caplog.records
        if record.name == "mz_ai_backend.errors"
        and getattr(record, "error_code", None) == ErrorCode.COMMON_BUSINESS_ERROR.value
    ]
    assert error_records
    assert error_records[0].request_id == "req-business"

    access_records = [
        record
        for record in caplog.records
        if record.name == "mz_ai_backend.http" and record.getMessage() == "request.completed"
    ]
    assert access_records
    assert access_records[0].status_code == 400
    assert access_records[0].duration_ms is not None


def test_unexpected_exception_hides_internal_details_and_logs_stack(caplog) -> None:
    caplog.set_level(logging.INFO)

    with _build_test_client() as client:
        response = client.get("/api/v1/test/crash")

    body = response.json()
    assert response.status_code == 500
    assert body["code"] == ErrorCode.SYSTEM_UNEXPECTED_ERROR.value
    assert body["message"] == "Unexpected internal error."
    assert "boom" not in body["message"]

    error_records = [
        record
        for record in caplog.records
        if record.name == "mz_ai_backend.errors"
        and getattr(record, "error_code", None) == ErrorCode.SYSTEM_UNEXPECTED_ERROR.value
    ]
    assert error_records
    assert error_records[0].exc_info is not None
