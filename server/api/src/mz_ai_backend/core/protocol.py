from __future__ import annotations

from datetime import UTC, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

from .error_codes import ErrorCode
from .request_context import get_request_id


T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response envelope."""

    model_config = ConfigDict(frozen=True)

    code: str
    message: str
    data: T | None
    request_id: str
    timestamp: datetime


def _resolve_request_id(request_id: str | None) -> str:
    if request_id is not None:
        return request_id
    return get_request_id()


def _resolve_timestamp(timestamp: datetime | None) -> datetime:
    return timestamp if timestamp is not None else datetime.now(UTC)


def success_response(
    *,
    data: T | None = None,
    message: str = "success",
    request_id: str | None = None,
    timestamp: datetime | None = None,
) -> ApiResponse[T]:
    """Build a success response envelope."""

    return ApiResponse[T](
        code=ErrorCode.COMMON_SUCCESS.value,
        message=message,
        data=data,
        request_id=_resolve_request_id(request_id),
        timestamp=_resolve_timestamp(timestamp),
    )


def error_response(
    *,
    error_code: ErrorCode | str,
    message: str,
    request_id: str | None = None,
    timestamp: datetime | None = None,
) -> ApiResponse[None]:
    """Build a failure response envelope."""

    return ApiResponse[None](
        code=str(error_code),
        message=message,
        data=None,
        request_id=_resolve_request_id(request_id),
        timestamp=_resolve_timestamp(timestamp),
    )


__all__ = ["ApiResponse", "error_response", "success_response"]
