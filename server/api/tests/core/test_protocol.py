from __future__ import annotations

from datetime import UTC, datetime

from mz_ai_backend.core import ErrorCode, error_response, success_response


def test_success_response_uses_explicit_request_metadata() -> None:
    timestamp = datetime(2026, 3, 25, 12, 0, tzinfo=UTC)

    response = success_response(
        data={"status": "ok"},
        request_id="request-001",
        timestamp=timestamp,
    )

    assert response.code == ErrorCode.COMMON_SUCCESS.value
    assert response.message == "success"
    assert response.data == {"status": "ok"}
    assert response.request_id == "request-001"
    assert response.timestamp == timestamp


def test_error_response_uses_explicit_error_code() -> None:
    timestamp = datetime(2026, 3, 25, 12, 0, tzinfo=UTC)

    response = error_response(
        error_code=ErrorCode.SYSTEM_INTERNAL_ERROR,
        message="Internal server error.",
        request_id="request-002",
        timestamp=timestamp,
    )

    assert response.code == ErrorCode.SYSTEM_INTERNAL_ERROR.value
    assert response.message == "Internal server error."
    assert response.data is None
    assert response.request_id == "request-002"
    assert response.timestamp == timestamp
