from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..application import (
    AgentAccountSummary,
    AgentAuthenticationResult,
    AgentWechatLoginSessionStatusResult,
    CreateAgentWechatLoginSessionResult,
    ExchangeAgentWechatLoginCommand,
    LogoutAgentSessionCommand,
    LogoutAgentSessionResult,
    RequestAgentEmailLoginChallengeCommand,
    RequestAgentEmailLoginChallengeResult,
    RefreshAgentSessionCommand,
    VerifyAgentEmailLoginChallengeCommand,
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


class RequestAgentEmailLoginChallengeRequest(BaseModel):
    """HTTP request payload for one email login challenge."""

    model_config = ConfigDict(frozen=True)

    email: str

    def to_command(self) -> RequestAgentEmailLoginChallengeCommand:
        return RequestAgentEmailLoginChallengeCommand(email=self.email)


class AgentEmailLoginChallengeResponse(BaseModel):
    """HTTP response payload for one email login challenge."""

    model_config = ConfigDict(frozen=True)

    login_challenge_id: str
    expires_at: datetime
    cooldown_seconds: int

    @classmethod
    def from_result(
        cls,
        result: RequestAgentEmailLoginChallengeResult,
    ) -> "AgentEmailLoginChallengeResponse":
        return cls(
            login_challenge_id=_serialize_business_id(result.challenge.login_challenge_id),
            expires_at=result.challenge.expires_at,
            cooldown_seconds=result.challenge.cooldown_seconds,
        )


class VerifyAgentEmailLoginChallengeRequest(BaseModel):
    """HTTP request payload for verifying one email login challenge."""

    model_config = ConfigDict(frozen=True)

    verification_code: str

    def to_command(
        self,
        *,
        login_challenge_id: int,
    ) -> VerifyAgentEmailLoginChallengeCommand:
        return VerifyAgentEmailLoginChallengeCommand(
            login_challenge_id=login_challenge_id,
            verification_code=self.verification_code,
        )


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
