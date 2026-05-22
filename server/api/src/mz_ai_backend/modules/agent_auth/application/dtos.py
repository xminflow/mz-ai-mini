from __future__ import annotations

import re
from datetime import UTC, datetime, timedelta

from pydantic import BaseModel, ConfigDict, field_validator

from ..domain import (
    AgentAccountStatus,
    AgentWechatLoginSessionStatus,
    AgentWechatSubscribeStatus,
)


EMAIL_PATTERN = re.compile(r"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$", re.IGNORECASE)
EMAIL_LOGIN_CODE_PATTERN = re.compile(r"^\d{6}$")
USERNAME_INPUT_PATTERN = re.compile(r"^[a-z0-9_]{3,32}$")


def normalize_agent_username(value: str) -> str:
    """Normalize one ua-agent username for persistence and comparisons."""

    return value.strip().lower()


def normalize_agent_username_input(value: str) -> str:
    """规范化并校验用户提交的用户名：长度 3-32，仅允许 a-z / 0-9 / 下划线，存储统一小写。

    用于个人信息页修改用户名等用户提交场景；系统内部自动生成的用户名（如 wxoa_{snowflake}）
    不走该校验。
    """

    normalized = value.strip().lower()
    if USERNAME_INPUT_PATTERN.fullmatch(normalized) is None:
        raise ValueError(
            "username 必须为 3-32 个字符，仅允许小写字母、数字、下划线。"
        )
    return normalized


def normalize_agent_email(value: str) -> str:
    """Normalize one ua-agent email for persistence and comparisons."""

    normalized = value.strip().lower()
    if normalized == "":
        raise ValueError("email must not be blank.")
    if EMAIL_PATTERN.fullmatch(normalized) is None:
        raise ValueError("email must be a valid email address.")
    return normalized


def normalize_email_login_code(value: str) -> str:
    """Normalize one submitted email login verification code."""

    normalized = value.strip()
    if EMAIL_LOGIN_CODE_PATTERN.fullmatch(normalized) is None:
        raise ValueError("verification_code must be exactly 6 digits.")
    return normalized


class AgentAccountSummary(BaseModel):
    """Public account summary returned to ua-agent clients."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None
    status: AgentAccountStatus
    created_at: datetime


class RefreshAgentSessionCommand(BaseModel):
    """Input command for rotating one refresh token."""

    model_config = ConfigDict(frozen=True)

    refresh_token: str

    @field_validator("refresh_token")
    @classmethod
    def validate_refresh_token(cls, value: str) -> str:
        normalized = value.strip()
        if normalized == "":
            raise ValueError("refresh_token must not be blank.")
        return normalized


class LogoutAgentSessionCommand(RefreshAgentSessionCommand):
    """Input command for revoking one refresh token session."""


class GetCurrentAgentAccountQuery(BaseModel):
    """Input query for reading the current account from an access token."""

    model_config = ConfigDict(frozen=True)

    access_token: str

    @field_validator("access_token")
    @classmethod
    def validate_access_token(cls, value: str) -> str:
        normalized = value.strip()
        if normalized == "":
            raise ValueError("access_token must not be blank.")
        return normalized


class AgentAccountRegistration(BaseModel):
    """Persistence payload for creating one ua-agent account."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None = None
    password_hash: str | None = None
    password_salt: str | None = None
    password_scheme_version: str | None = None
    status: AgentAccountStatus


class AgentTokenPair(BaseModel):
    """Issued access and refresh tokens returned to clients."""

    model_config = ConfigDict(frozen=True)

    access_token: str
    access_token_expires_at: datetime
    refresh_token: str
    refresh_token_expires_at: datetime


class AgentSessionIssue(BaseModel):
    """Persistence payload for issuing one login session."""

    model_config = ConfigDict(frozen=True)

    session_id: int
    account_id: int
    refresh_token_hash: str
    refresh_token_expires_at: datetime
    access_token_id: int
    access_token_hash: str
    access_token_expires_at: datetime


class AgentAuthenticationResult(BaseModel):
    """Authentication result returned after register/login/refresh."""

    model_config = ConfigDict(frozen=True)

    account: AgentAccountSummary
    tokens: AgentTokenPair


class AgentEmailVerificationChallengeSummary(BaseModel):
    """邮箱验证码 challenge 概要：用于 profile 绑邮箱场景。"""

    model_config = ConfigDict(frozen=True)

    login_challenge_id: int
    expires_at: datetime
    cooldown_seconds: int


class AgentEmailVerificationChallengeCreate(BaseModel):
    """邮箱验证码 challenge 持久化载荷。"""

    model_config = ConfigDict(frozen=True)

    login_challenge_id: int
    email: str
    code_hash: str
    expires_at: datetime


class AgentWechatLoginSessionSummary(BaseModel):
    """Public QR login session summary returned to ua-agent clients."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    status: AgentWechatLoginSessionStatus
    qr_code_url: str
    expires_at: datetime
    poll_interval_ms: int


class CreateAgentWechatLoginSessionCommand(BaseModel):
    """Input command for creating one QR login session."""

    model_config = ConfigDict(frozen=True)


class CreateAgentWechatLoginSessionResult(BaseModel):
    """Result returned after creating one QR login session."""

    model_config = ConfigDict(frozen=True)

    session: AgentWechatLoginSessionSummary


class GetAgentWechatLoginSessionQuery(BaseModel):
    """Input query for polling one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int


class AgentWechatLoginSessionStatusResult(BaseModel):
    """Result returned while polling one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    status: AgentWechatLoginSessionStatus
    expires_at: datetime


class ExchangeAgentWechatLoginCommand(BaseModel):
    """Input command for exchanging one authenticated QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int


class AgentWechatIdentityUpsert(BaseModel):
    """Persistence payload for one official account identity binding."""

    model_config = ConfigDict(frozen=True)

    identity_id: int
    account_id: int
    official_openid: str
    subscribe_status: AgentWechatSubscribeStatus
    subscribed_at: datetime | None
    unsubscribed_at: datetime | None
    last_event_at: datetime | None


class AgentWechatLoginSessionCreate(BaseModel):
    """Persistence payload for one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    scene_key: str
    status: AgentWechatLoginSessionStatus
    expires_at: datetime


class AgentWechatLoginGrantIssue(BaseModel):
    """Persistence payload for one QR login grant."""

    model_config = ConfigDict(frozen=True)
    authenticated_at: datetime


class HandleAgentWechatCallbackCommand(BaseModel):
    """Input command for handling one official account callback."""

    model_config = ConfigDict(frozen=True)

    signature: str | None
    msg_signature: str | None
    timestamp: str | None
    nonce: str | None
    xml_body: str


class LogoutAgentSessionResult(BaseModel):
    """Result returned after logout."""

    model_config = ConfigDict(frozen=True)

    revoked: bool


class RequestEmailBindingChallengeCommand(BaseModel):
    """请求邮箱绑定验证码：需要已登录用户的 access_token。"""

    model_config = ConfigDict(frozen=True)

    access_token: str
    email: str

    @field_validator("access_token")
    @classmethod
    def validate_access_token(cls, value: str) -> str:
        normalized = value.strip()
        if normalized == "":
            raise ValueError("access_token must not be blank.")
        return normalized

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_agent_email(value)


class RequestEmailBindingChallengeResult(BaseModel):
    """请求邮箱绑定验证码后返回的 challenge 概要。"""

    model_config = ConfigDict(frozen=True)

    challenge: AgentEmailVerificationChallengeSummary


class VerifyEmailBindingChallengeCommand(BaseModel):
    """验证邮箱绑定验证码：需要 access_token + challenge id + 6 位验证码。"""

    model_config = ConfigDict(frozen=True)

    access_token: str
    login_challenge_id: int
    verification_code: str

    @field_validator("access_token")
    @classmethod
    def validate_access_token(cls, value: str) -> str:
        normalized = value.strip()
        if normalized == "":
            raise ValueError("access_token must not be blank.")
        return normalized

    @field_validator("verification_code")
    @classmethod
    def validate_verification_code(cls, value: str) -> str:
        return normalize_email_login_code(value)


class VerifyEmailBindingChallengeResult(BaseModel):
    """验证通过后返回更新后的账号信息。"""

    model_config = ConfigDict(frozen=True)

    account: AgentAccountSummary


class ChangeAgentUsernameCommand(BaseModel):
    """修改用户名命令：需要 access_token + 新用户名。"""

    model_config = ConfigDict(frozen=True)

    access_token: str
    new_username: str

    @field_validator("access_token")
    @classmethod
    def validate_access_token(cls, value: str) -> str:
        normalized = value.strip()
        if normalized == "":
            raise ValueError("access_token must not be blank.")
        return normalized

    @field_validator("new_username")
    @classmethod
    def validate_new_username(cls, value: str) -> str:
        return normalize_agent_username_input(value)


class ChangeAgentUsernameResult(BaseModel):
    """改名成功后返回更新后的账号信息。"""

    model_config = ConfigDict(frozen=True)

    account: AgentAccountSummary


def build_access_token_expiry(*, ttl_seconds: int) -> datetime:
    return datetime.now(UTC) + timedelta(seconds=ttl_seconds)


def build_refresh_token_expiry(*, ttl_days: int) -> datetime:
    return datetime.now(UTC) + timedelta(days=ttl_days)


# dev-only: 本地调试用，跳过微信扫码直接以指定用户名换 token。生产环境必须在路由层拒绝。
# 默认 username 必须满足 USERNAME_INPUT_PATTERN（3-32 个字符，仅 a-z / 0-9 / _），不可含 hyphen。
DEV_FAKE_LOGIN_DEFAULT_USERNAME = "dev_local"


class DevFakeLoginCommand(BaseModel):
    """Input command for the dev-only fake login backdoor.

    用法仅限本地开发联调，绕过微信扫码与公众号回调；handler 必须在 env=production 时拒绝调用。
    """

    model_config = ConfigDict(frozen=True)

    username: str = DEV_FAKE_LOGIN_DEFAULT_USERNAME

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        return normalize_agent_username_input(value)
