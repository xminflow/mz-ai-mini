from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class CloudIdentityMissingException(BusinessException):
    """Raised when the trusted cloud hosting identity is unavailable."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AUTH_CLOUD_IDENTITY_MISSING,
            message="Mini program cloud identity is missing.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class UserDisabledException(BusinessException):
    """Raised when a disabled user attempts to sign in."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.USER_DISABLED,
            message="User account is disabled.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class UserAlreadyExistsException(BusinessException):
    """Raised when automatic registration hits an existing unique identity."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.USER_ALREADY_EXISTS,
            message="User already exists.",
            http_status=HTTPStatus.CONFLICT,
        )


class UserNotFoundException(BusinessException):
    """Raised when the current authenticated user record does not exist."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.USER_NOT_FOUND,
            message="User does not exist.",
            http_status=HTTPStatus.NOT_FOUND,
        )
