from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class AccountMembershipSkuInvalidException(BusinessException):
    """Raised when a website membership SKU is unsupported."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.ACCOUNT_MEMBERSHIP_SKU_INVALID,
            message="Account membership SKU is invalid.",
            http_status=HTTPStatus.BAD_REQUEST,
        )


class AccountMembershipOrderNotFoundException(BusinessException):
    """Raised when a website membership order cannot be found."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.ACCOUNT_MEMBERSHIP_ORDER_NOT_FOUND,
            message="Account membership order does not exist.",
            http_status=HTTPStatus.NOT_FOUND,
        )


class AccountMembershipOrderForbiddenException(BusinessException):
    """Raised when an order does not belong to the current account."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.ACCOUNT_MEMBERSHIP_ORDER_FORBIDDEN,
            message="Account membership order is forbidden.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class AccountMembershipOrderStatusInvalidException(BusinessException):
    """Raised when a website membership order transition is invalid."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.ACCOUNT_MEMBERSHIP_ORDER_STATUS_INVALID,
            message="Account membership order state is invalid.",
            http_status=HTTPStatus.CONFLICT,
        )
