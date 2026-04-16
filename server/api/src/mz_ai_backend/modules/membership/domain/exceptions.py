from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException
from mz_ai_backend.shared.wechat_pay import (
    WechatPayConfigMissingException,
    WechatPayNotifyInvalidException,
    WechatPayNotifyMismatchException,
    WechatPayOrderCreateFailedException,
)

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


