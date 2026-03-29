from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException, SystemException


class MembershipPlanNotOpenException(BusinessException):
    """Raised when requesting a membership plan that is not open yet."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBERSHIP_PLAN_NOT_OPEN,
            message="The membership plan is not open.",
            http_status=HTTPStatus.BAD_REQUEST,
        )


class MembershipAlreadyActiveException(BusinessException):
    """Raised when user already has an active membership for the same tier."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBERSHIP_ALREADY_ACTIVE,
            message="Membership is already active.",
            http_status=HTTPStatus.CONFLICT,
        )


class MembershipOrderNotFoundException(BusinessException):
    """Raised when membership order does not exist."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.MEMBERSHIP_ORDER_NOT_FOUND,
            message="Membership order does not exist.",
            http_status=HTTPStatus.NOT_FOUND,
        )


class MembershipOrderStatusInvalidException(BusinessException):
    """Raised when membership order state transition is invalid."""

    def __init__(self, *, message: str = "Membership order state is invalid.") -> None:
        super().__init__(
            error_code=ErrorCode.MEMBERSHIP_ORDER_STATUS_INVALID,
            message=message,
            http_status=HTTPStatus.CONFLICT,
        )


class WechatPayNotifyInvalidException(BusinessException):
    """Raised when WeChat Pay callback payload cannot be verified."""

    def __init__(self, *, message: str = "WeChat Pay callback is invalid.") -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_NOTIFY_INVALID,
            message=message,
            http_status=HTTPStatus.BAD_REQUEST,
        )


class WechatPayNotifyMismatchException(BusinessException):
    """Raised when callback order data mismatches persisted order data."""

    def __init__(self, *, message: str = "WeChat Pay callback does not match order.") -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_NOTIFY_MISMATCH,
            message=message,
            http_status=HTTPStatus.CONFLICT,
        )


class WechatPayOrderCreateFailedException(SystemException):
    """Raised when creating WeChat Pay order fails."""

    def __init__(self, *, message: str = "Failed to create WeChat Pay order.") -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_ORDER_CREATE_FAILED,
            message=message,
            http_status=HTTPStatus.BAD_GATEWAY,
        )


class WechatPayConfigMissingException(SystemException):
    """Raised when WeChat Pay runtime configuration is missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.PAYMENT_WECHAT_CONFIG_MISSING,
            message="WeChat Pay configuration is missing.",
            http_status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )
