from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from ..application.dtos import normalize_agent_email, normalize_agent_username_input

from ..application import (
    AgentAccountSummary,
    AgentAuthenticationResult,
    AgentWechatLoginSessionStatusResult,
    ChangeAgentUsernameCommand,
    ChangeAgentUsernameResult,
    CreateAgentWechatLoginSessionResult,
    ExchangeAgentWechatLoginCommand,
    LogoutAgentSessionCommand,
    LogoutAgentSessionResult,
    RefreshAgentSessionCommand,
    RequestEmailBindingChallengeCommand,
    RequestEmailBindingChallengeResult,
    VerifyEmailBindingChallengeCommand,
    VerifyEmailBindingChallengeResult,
)


def _serialize_business_id(value: int) -> str:
    return str(value)


class AgentAuthAccountResponse(BaseModel):
    """HTTP response payload for one authenticated ua-agent account."""

    model_config = ConfigDict(frozen=True)

    account_id: str
    username: str
    email: str | None
    status: str
    created_at: datetime

    @classmethod
    def from_summary(cls, summary: AgentAccountSummary) -> "AgentAuthAccountResponse":
        return cls(
            account_id=_serialize_business_id(summary.account_id),
            username=summary.username,
            email=summary.email,
            status=summary.status.value,
            created_at=summary.created_at,
        )


class AgentAuthTokensResponse(BaseModel):
    """HTTP response payload for one issued token pair."""

    model_config = ConfigDict(frozen=True)

    access_token: str
    access_token_expires_at: datetime
    refresh_token: str
    refresh_token_expires_at: datetime


class AgentAuthenticationResponse(BaseModel):
    """HTTP response payload for refresh / QR exchange."""

    model_config = ConfigDict(frozen=True)

    account: AgentAuthAccountResponse
    tokens: AgentAuthTokensResponse

    @classmethod
    def from_result(
        cls,
        result: AgentAuthenticationResult,
    ) -> "AgentAuthenticationResponse":
        return cls(
            account=AgentAuthAccountResponse.from_summary(result.account),
            tokens=AgentAuthTokensResponse.model_validate(result.tokens.model_dump(mode="json")),
        )


class RefreshAgentSessionRequest(BaseModel):
    """HTTP request payload for refresh."""

    model_config = ConfigDict(frozen=True)

    refresh_token: str

    def to_command(self) -> RefreshAgentSessionCommand:
        return RefreshAgentSessionCommand(refresh_token=self.refresh_token)


class LogoutAgentSessionRequest(BaseModel):
    """HTTP request payload for logout."""

    model_config = ConfigDict(frozen=True)

    refresh_token: str

    def to_command(self) -> LogoutAgentSessionCommand:
        return LogoutAgentSessionCommand(refresh_token=self.refresh_token)


class LogoutAgentSessionResponse(BaseModel):
    """HTTP response payload for logout."""

    model_config = ConfigDict(frozen=True)

    revoked: bool

    @classmethod
    def from_result(
        cls,
        result: LogoutAgentSessionResult,
    ) -> "LogoutAgentSessionResponse":
        return cls(revoked=result.revoked)


class ExchangeAgentWechatLoginRequest(BaseModel):
    """HTTP request payload for QR login exchange."""

    model_config = ConfigDict(frozen=True)

    def to_command(self, *, login_session_id: int) -> ExchangeAgentWechatLoginCommand:
        return ExchangeAgentWechatLoginCommand(login_session_id=login_session_id)


class AgentWechatLoginSessionResponse(BaseModel):
    """HTTP response payload for one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: str
    status: str
    qr_code_url: str
    expires_at: datetime
    poll_interval_ms: int

    @classmethod
    def from_result(
        cls,
        result: CreateAgentWechatLoginSessionResult,
    ) -> "AgentWechatLoginSessionResponse":
        return cls(
            login_session_id=_serialize_business_id(result.session.login_session_id),
            status=result.session.status.value,
            qr_code_url=result.session.qr_code_url,
            expires_at=result.session.expires_at,
            poll_interval_ms=result.session.poll_interval_ms,
        )


class RequestEmailBindingChallengeRequest(BaseModel):
    """绑定邮箱发码请求体。"""

    model_config = ConfigDict(frozen=True)

    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_agent_email(value)

    def to_command(self, *, access_token: str) -> RequestEmailBindingChallengeCommand:
        return RequestEmailBindingChallengeCommand(
            access_token=access_token,
            email=self.email,
        )


class EmailBindingChallengeResponse(BaseModel):
    """绑定邮箱发码响应。"""

    model_config = ConfigDict(frozen=True)

    login_challenge_id: str
    expires_at: datetime
    cooldown_seconds: int

    @classmethod
    def from_result(
        cls,
        result: RequestEmailBindingChallengeResult,
    ) -> "EmailBindingChallengeResponse":
        return cls(
            login_challenge_id=_serialize_business_id(result.challenge.login_challenge_id),
            expires_at=result.challenge.expires_at,
            cooldown_seconds=result.challenge.cooldown_seconds,
        )


class VerifyEmailBindingChallengeRequest(BaseModel):
    """绑定邮箱验证请求体。"""

    model_config = ConfigDict(frozen=True)

    verification_code: str

    def to_command(
        self,
        *,
        access_token: str,
        login_challenge_id: int,
    ) -> VerifyEmailBindingChallengeCommand:
        return VerifyEmailBindingChallengeCommand(
            access_token=access_token,
            login_challenge_id=login_challenge_id,
            verification_code=self.verification_code,
        )


class VerifyEmailBindingChallengeResponse(BaseModel):
    """绑定邮箱验证成功后返回更新后的账号。"""

    model_config = ConfigDict(frozen=True)

    account: AgentAuthAccountResponse

    @classmethod
    def from_result(
        cls,
        result: VerifyEmailBindingChallengeResult,
    ) -> "VerifyEmailBindingChallengeResponse":
        return cls(account=AgentAuthAccountResponse.from_summary(result.account))


class ChangeAgentUsernameRequest(BaseModel):
    """修改用户名请求体。"""

    model_config = ConfigDict(frozen=True)

    new_username: str

    @field_validator("new_username")
    @classmethod
    def validate_new_username(cls, value: str) -> str:
        return normalize_agent_username_input(value)

    def to_command(self, *, access_token: str) -> ChangeAgentUsernameCommand:
        return ChangeAgentUsernameCommand(
            access_token=access_token,
            new_username=self.new_username,
        )


class ChangeAgentUsernameResponse(BaseModel):
    """修改用户名成功后返回更新后的账号。"""

    model_config = ConfigDict(frozen=True)

    account: AgentAuthAccountResponse

    @classmethod
    def from_result(
        cls,
        result: ChangeAgentUsernameResult,
    ) -> "ChangeAgentUsernameResponse":
        return cls(account=AgentAuthAccountResponse.from_summary(result.account))


class AgentWechatLoginSessionStatusResponse(BaseModel):
    """HTTP response payload for one QR login session status."""

    model_config = ConfigDict(frozen=True)

    login_session_id: str
    status: str
    expires_at: datetime

    @classmethod
    def from_result(
        cls,
        result: AgentWechatLoginSessionStatusResult,
    ) -> "AgentWechatLoginSessionStatusResponse":
        return cls(
            login_session_id=_serialize_business_id(result.login_session_id),
            status=result.status.value,
            expires_at=result.expires_at,
        )
