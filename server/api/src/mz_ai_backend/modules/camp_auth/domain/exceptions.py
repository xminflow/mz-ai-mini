from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class CampAccountDisabledException(BusinessException):
    """Raised when a disabled account attempts to authenticate."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.USER_DISABLED,
            message="Camp account is disabled.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class CampAccessTokenExpiredException(BusinessException):
    """Raised when an access token is expired or missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_ACCESS_TOKEN_EXPIRED,
            message="Access token is expired or invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class CampRefreshTokenExpiredException(BusinessException):
    """Raised when a refresh token is expired or missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_REFRESH_TOKEN_EXPIRED,
            message="Refresh token is expired or invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class CampSessionRevokedException(BusinessException):
    """Raised when a refresh session was already revoked."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_SESSION_REVOKED,
            message="Authentication session has been revoked.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class CampWechatLoginSessionExpiredException(BusinessException):
    """Raised when the QR login session is expired or missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_WECHAT_LOGIN_SESSION_EXPIRED,
            message="WeChat login session is expired or invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class CampWechatLoginSessionPendingException(BusinessException):
    """Raised when the QR login session has not been authenticated yet."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_WECHAT_LOGIN_SESSION_PENDING,
            message="WeChat login session is pending.",
            http_status=HTTPStatus.CONFLICT,
        )


class CampWechatLoginSessionConsumedException(BusinessException):
    """Raised when the QR login session grant was already consumed."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_WECHAT_LOGIN_SESSION_CONSUMED,
            message="WeChat login session has already been consumed.",
            http_status=HTTPStatus.CONFLICT,
        )


class CampWechatIdentityNotSubscribedException(BusinessException):
    """Raised when the official account identity is not currently subscribed."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_WECHAT_IDENTITY_NOT_SUBSCRIBED,
            message="WeChat official account identity is not subscribed.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class CampWechatCallbackInvalidException(BusinessException):
    """Raised when the WeChat callback request cannot be verified or parsed."""

    def __init__(self, *, message: str = "WeChat callback is invalid.") -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_WECHAT_CALLBACK_INVALID,
            message=message,
            http_status=HTTPStatus.BAD_REQUEST,
        )


class CampWechatConfigMissingException(BusinessException):
    """Raised when official account configuration is missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_AUTH_WECHAT_CONFIG_MISSING,
            message="WeChat official account configuration is missing.",
            http_status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )
