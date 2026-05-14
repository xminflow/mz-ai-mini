from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException


class AgentUsernameTakenException(BusinessException):
    """Raised when the requested username already exists."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_USERNAME_TAKEN,
            message="Username is already taken.",
            http_status=HTTPStatus.CONFLICT,
        )


class AgentInvalidCredentialsException(BusinessException):
    """Raised when username/password authentication fails."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_INVALID_CREDENTIALS,
            message="Username or password is invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class AgentAccountDisabledException(BusinessException):
    """Raised when a disabled account attempts to authenticate."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.USER_DISABLED,
            message="Agent account is disabled.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class AgentAccessTokenExpiredException(BusinessException):
    """Raised when an access token is expired or missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_ACCESS_TOKEN_EXPIRED,
            message="Access token is expired or invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class AgentRefreshTokenExpiredException(BusinessException):
    """Raised when a refresh token is expired or missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_REFRESH_TOKEN_EXPIRED,
            message="Refresh token is expired or invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class AgentSessionRevokedException(BusinessException):
    """Raised when a refresh session was already revoked."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_SESSION_REVOKED,
            message="Authentication session has been revoked.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class AgentWechatLoginSessionExpiredException(BusinessException):
    """Raised when the QR login session is expired or missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_WECHAT_LOGIN_SESSION_EXPIRED,
            message="WeChat login session is expired or invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class AgentWechatLoginSessionPendingException(BusinessException):
    """Raised when the QR login session has not been authenticated yet."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_WECHAT_LOGIN_SESSION_PENDING,
            message="WeChat login session is pending.",
            http_status=HTTPStatus.CONFLICT,
        )


class AgentWechatLoginSessionConsumedException(BusinessException):
    """Raised when the QR login session grant was already consumed."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_WECHAT_LOGIN_SESSION_CONSUMED,
            message="WeChat login session has already been consumed.",
            http_status=HTTPStatus.CONFLICT,
        )


class AgentWechatIdentityNotSubscribedException(BusinessException):
    """Raised when the official account identity is not currently subscribed."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_WECHAT_IDENTITY_NOT_SUBSCRIBED,
            message="WeChat official account identity is not subscribed.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class AgentWechatCallbackInvalidException(BusinessException):
    """Raised when the WeChat callback request cannot be verified or parsed."""

    def __init__(self, *, message: str = "WeChat callback is invalid.") -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_WECHAT_CALLBACK_INVALID,
            message=message,
            http_status=HTTPStatus.BAD_REQUEST,
        )


class AgentWechatConfigMissingException(BusinessException):
    """Raised when official account configuration is missing."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_WECHAT_CONFIG_MISSING,
            message="WeChat official account configuration is missing.",
            http_status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )


class AgentEmailLoginChallengeExpiredException(BusinessException):
    """Raised when one email login challenge is expired or unavailable."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_EMAIL_LOGIN_CHALLENGE_EXPIRED,
            message="Email login challenge is expired or invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class AgentEmailLoginCodeInvalidException(BusinessException):
    """Raised when the submitted email verification code is invalid."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_EMAIL_LOGIN_CODE_INVALID,
            message="Email verification code is invalid.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )


class AgentEmailSendCooldownException(BusinessException):
    """Raised when one email login code is requested too frequently."""

    def __init__(self, *, retry_after_seconds: int) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_EMAIL_SEND_COOLDOWN,
            message=f"Email login code was requested too recently. Retry after {retry_after_seconds} seconds.",
            http_status=HTTPStatus.CONFLICT,
            details={"retry_after_seconds": retry_after_seconds},
        )


class AgentEmailConfigMissingException(BusinessException):
    """Raised when SMTP configuration is incomplete."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_EMAIL_CONFIG_MISSING,
            message="Email login configuration is missing.",
            http_status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )


class AgentEmailDeliveryFailedException(BusinessException):
    """Raised when one email login code cannot be delivered."""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.AGENT_AUTH_EMAIL_DELIVERY_FAILED,
            message="Email verification code delivery failed.",
            http_status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )
