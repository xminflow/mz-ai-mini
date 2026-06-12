from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from ..application import (
    CampAccountSummary,
    CampAuthenticationResult,
    CampWechatLoginSessionStatusResult,
    CreateCampWechatLoginSessionResult,
    ExchangeCampWechatLoginCommand,
    LogoutCampSessionCommand,
    LogoutCampSessionResult,
    RefreshCampSessionCommand,
)
from ..application.dtos import DEV_FAKE_LOGIN_DEFAULT_USERNAME, DevCampFakeLoginCommand


def _serialize_business_id(value: int) -> str:
    return str(value)


class CampMembershipResponse(BaseModel):
    """登录态会员摘要 HTTP 响应。"""

    model_config = ConfigDict(frozen=True)

    tier: str
    is_active: bool
    expires_at: datetime | None
    remaining_days: int


class CampAuthAccountResponse(BaseModel):
    """HTTP response payload for one authenticated camp account."""

    model_config = ConfigDict(frozen=True)

    account_id: str
    username: str
    email: str | None
    status: str
    created_at: datetime
    membership: CampMembershipResponse | None

    @classmethod
    def from_summary(cls, summary: CampAccountSummary) -> "CampAuthAccountResponse":
        membership = (
            CampMembershipResponse(
                tier=summary.membership.tier,
                is_active=summary.membership.is_active,
                expires_at=summary.membership.expires_at,
                remaining_days=summary.membership.remaining_days,
            )
            if summary.membership is not None
            else None
        )
        return cls(
            account_id=_serialize_business_id(summary.account_id),
            username=summary.username,
            email=summary.email,
            status=summary.status.value,
            created_at=summary.created_at,
            membership=membership,
        )


class CampAuthTokensResponse(BaseModel):
    """HTTP response payload for one issued token pair."""

    model_config = ConfigDict(frozen=True)

    access_token: str
    access_token_expires_at: datetime
    refresh_token: str
    refresh_token_expires_at: datetime


class CampAuthenticationResponse(BaseModel):
    """HTTP response payload for refresh / QR exchange."""

    model_config = ConfigDict(frozen=True)

    account: CampAuthAccountResponse
    tokens: CampAuthTokensResponse

    @classmethod
    def from_result(
        cls,
        result: CampAuthenticationResult,
    ) -> "CampAuthenticationResponse":
        return cls(
            account=CampAuthAccountResponse.from_summary(result.account),
            tokens=CampAuthTokensResponse.model_validate(result.tokens.model_dump(mode="json")),
        )


class RefreshCampSessionRequest(BaseModel):
    """HTTP request payload for refresh."""

    model_config = ConfigDict(frozen=True)

    refresh_token: str

    def to_command(self) -> RefreshCampSessionCommand:
        return RefreshCampSessionCommand(refresh_token=self.refresh_token)


class LogoutCampSessionRequest(BaseModel):
    """HTTP request payload for logout."""

    model_config = ConfigDict(frozen=True)

    refresh_token: str

    def to_command(self) -> LogoutCampSessionCommand:
        return LogoutCampSessionCommand(refresh_token=self.refresh_token)


class LogoutCampSessionResponse(BaseModel):
    """HTTP response payload for logout."""

    model_config = ConfigDict(frozen=True)

    revoked: bool

    @classmethod
    def from_result(
        cls,
        result: LogoutCampSessionResult,
    ) -> "LogoutCampSessionResponse":
        return cls(revoked=result.revoked)


class ExchangeCampWechatLoginRequest(BaseModel):
    """HTTP request payload for QR login exchange."""

    model_config = ConfigDict(frozen=True)

    def to_command(self, *, login_session_id: int) -> ExchangeCampWechatLoginCommand:
        return ExchangeCampWechatLoginCommand(login_session_id=login_session_id)


class CampWechatLoginSessionResponse(BaseModel):
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
        result: CreateCampWechatLoginSessionResult,
    ) -> "CampWechatLoginSessionResponse":
        return cls(
            login_session_id=_serialize_business_id(result.session.login_session_id),
            status=result.session.status.value,
            qr_code_url=result.session.qr_code_url,
            expires_at=result.session.expires_at,
            poll_interval_ms=result.session.poll_interval_ms,
        )


class CampWechatLoginSessionStatusResponse(BaseModel):
    """HTTP response payload for one QR login session status."""

    model_config = ConfigDict(frozen=True)

    login_session_id: str
    status: str
    expires_at: datetime

    @classmethod
    def from_result(
        cls,
        result: CampWechatLoginSessionStatusResult,
    ) -> "CampWechatLoginSessionStatusResponse":
        return cls(
            login_session_id=_serialize_business_id(result.login_session_id),
            status=result.status.value,
            expires_at=result.expires_at,
        )


class DevCampFakeLoginRequest(BaseModel):
    """dev-only 免微信登录请求体；不传时用默认账号 dev_local、tier=none。"""

    model_config = ConfigDict(frozen=True)

    username: str = DEV_FAKE_LOGIN_DEFAULT_USERNAME
    tier: Literal["none", "basic", "premium"] = "none"

    def to_command(self) -> DevCampFakeLoginCommand:
        return DevCampFakeLoginCommand(username=self.username, tier=self.tier)
