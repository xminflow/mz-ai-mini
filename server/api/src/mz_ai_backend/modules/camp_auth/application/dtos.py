from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from ..domain import (
    CampAccountStatus,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)


def normalize_camp_username(value: str) -> str:
    """Normalize one camp username for persistence and comparisons."""

    return value.strip().lower()


class CampAccountSummary(BaseModel):
    """Public account summary returned to camp clients."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None
    status: CampAccountStatus
    created_at: datetime


class RefreshCampSessionCommand(BaseModel):
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


class LogoutCampSessionCommand(RefreshCampSessionCommand):
    """Input command for revoking one refresh token session."""


class GetCurrentCampAccountQuery(BaseModel):
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


class CampAccountRegistration(BaseModel):
    """Persistence payload for creating one camp account."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None = None
    status: CampAccountStatus


class CampTokenPair(BaseModel):
    """Issued access and refresh tokens returned to clients."""

    model_config = ConfigDict(frozen=True)

    access_token: str
    access_token_expires_at: datetime
    refresh_token: str
    refresh_token_expires_at: datetime


class CampSessionIssue(BaseModel):
    """Persistence payload for issuing one login session."""

    model_config = ConfigDict(frozen=True)

    session_id: int
    account_id: int
    refresh_token_hash: str
    refresh_token_expires_at: datetime
    access_token_id: int
    access_token_hash: str
    access_token_expires_at: datetime


class CampAuthenticationResult(BaseModel):
    """Authentication result returned after login/refresh."""

    model_config = ConfigDict(frozen=True)

    account: CampAccountSummary
    tokens: CampTokenPair


class CampWechatLoginSessionSummary(BaseModel):
    """Public QR login session summary returned to camp clients."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    status: CampWechatLoginSessionStatus
    qr_code_url: str
    expires_at: datetime
    poll_interval_ms: int


class CreateCampWechatLoginSessionCommand(BaseModel):
    """Input command for creating one QR login session."""

    model_config = ConfigDict(frozen=True)


class CreateCampWechatLoginSessionResult(BaseModel):
    """Result returned after creating one QR login session."""

    model_config = ConfigDict(frozen=True)

    session: CampWechatLoginSessionSummary


class GetCampWechatLoginSessionQuery(BaseModel):
    """Input query for polling one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int


class CampWechatLoginSessionStatusResult(BaseModel):
    """Result returned while polling one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    status: CampWechatLoginSessionStatus
    expires_at: datetime


class ExchangeCampWechatLoginCommand(BaseModel):
    """Input command for exchanging one authenticated QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int


class CampWechatIdentityUpsert(BaseModel):
    """Persistence payload for one official account identity binding."""

    model_config = ConfigDict(frozen=True)

    identity_id: int
    account_id: int
    official_openid: str
    subscribe_status: CampWechatSubscribeStatus
    subscribed_at: datetime | None
    unsubscribed_at: datetime | None
    last_event_at: datetime | None


class CampWechatLoginSessionCreate(BaseModel):
    """Persistence payload for one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    scene_key: str
    status: CampWechatLoginSessionStatus
    expires_at: datetime


class CampWechatLoginGrantIssue(BaseModel):
    """Persistence payload for one QR login grant."""

    model_config = ConfigDict(frozen=True)
    authenticated_at: datetime


class LogoutCampSessionResult(BaseModel):
    """Result returned after logout."""

    model_config = ConfigDict(frozen=True)

    revoked: bool
