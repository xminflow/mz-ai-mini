from __future__ import annotations

from collections.abc import Mapping
from http import HTTPStatus
from typing import Any

from .error_codes import ErrorCode


def _normalize_details(details: Mapping[str, Any] | None) -> dict[str, Any] | None:
    return dict(details) if details is not None else None


class AppException(Exception):
    """Base application exception with a stable error contract."""

    def __init__(
        self,
        *,
        error_code: ErrorCode | str,
        message: str,
        http_status: int,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.error_code = str(error_code)
        self.message = message
        self.http_status = http_status
        self.details = _normalize_details(details)


class BusinessException(AppException):
    """Exception for expected business rule failures."""

    def __init__(
        self,
        *,
        error_code: ErrorCode | str = ErrorCode.COMMON_BUSINESS_ERROR,
        message: str,
        http_status: int = HTTPStatus.BAD_REQUEST,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(
            error_code=error_code,
            message=message,
            http_status=http_status,
            details=details,
        )


class SystemException(AppException):
    """Exception for internal failures that are safe to classify explicitly."""

    def __init__(
        self,
        *,
        error_code: ErrorCode | str = ErrorCode.SYSTEM_INTERNAL_ERROR,
        message: str,
        http_status: int = HTTPStatus.INTERNAL_SERVER_ERROR,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(
            error_code=error_code,
            message=message,
            http_status=http_status,
            details=details,
        )


class ValidationException(BusinessException):
    """Exception for business-level validation failures."""

    def __init__(
        self,
        *,
        message: str,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(
            error_code=ErrorCode.COMMON_VALIDATION_ERROR,
            message=message,
            http_status=HTTPStatus.UNPROCESSABLE_ENTITY,
            details=details,
        )


class NotFoundException(BusinessException):
    """Exception for missing resources."""

    def __init__(
        self,
        *,
        message: str,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            http_status=HTTPStatus.NOT_FOUND,
            details=details,
        )


class UnauthorizedException(BusinessException):
    """Exception for unauthorized operations."""

    def __init__(
        self,
        *,
        error_code: ErrorCode | str = ErrorCode.COMMON_BUSINESS_ERROR,
        message: str,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(
            error_code=error_code,
            message=message,
            http_status=HTTPStatus.UNAUTHORIZED,
            details=details,
        )


class InternalServerException(SystemException):
    """Exception for explicit internal server failures."""

    def __init__(
        self,
        *,
        message: str = "Internal server error.",
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(
            error_code=ErrorCode.SYSTEM_INTERNAL_ERROR,
            message=message,
            http_status=HTTPStatus.INTERNAL_SERVER_ERROR,
            details=details,
        )


__all__ = [
    "AppException",
    "BusinessException",
    "InternalServerException",
    "NotFoundException",
    "SystemException",
    "UnauthorizedException",
    "ValidationException",
]
