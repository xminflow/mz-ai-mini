from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class AgentAccountStatus(StrEnum):
    """Supported account statuses for ua-agent remote authentication."""

    ACTIVE = "active"
    DISABLED = "disabled"


class AgentWechatSubscribeStatus(StrEnum):
    """Supported subscribe states for one official account identity."""

    SUBSCRIBED = "subscribed"
    UNSUBSCRIBED = "unsubscribed"


class AgentWechatLoginSessionStatus(StrEnum):
    """Supported statuses for one QR login session."""

    PENDING = "pending"
    AUTHENTICATED = "authenticated"
    EXPIRED = "expired"
    CONSUMED = "consumed"


class AgentAccount(BaseModel):
    """Domain entity for one ua-agent account."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None
    password_hash: str | None
    password_salt: str | None
    password_scheme_version: str | None
    status: AgentAccountStatus
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class AgentAuthSession(BaseModel):
    """Domain entity for one refreshable login session."""

    model_config = ConfigDict(frozen=True)

    session_id: int
    account_id: int
    refresh_token_hash: str
    expires_at: datetime
    revoked_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AgentAccessTokenRecord(BaseModel):
    """Domain entity for one issued access token."""

    model_config = ConfigDict(frozen=True)

    token_id: int
    session_id: int
    access_token_hash: str
    expires_at: datetime
    created_at: datetime


class AgentWechatIdentity(BaseModel):
    """Domain entity for one official account identity binding."""

    model_config = ConfigDict(frozen=True)

    identity_id: int
    account_id: int
    official_openid: str
    subscribe_status: AgentWechatSubscribeStatus
    subscribed_at: datetime | None
    unsubscribed_at: datetime | None
    last_event_at: datetime | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class AgentWechatLoginSession(BaseModel):
    """Domain entity for one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    scene_key: str
    status: AgentWechatLoginSessionStatus
    official_openid: str | None
    account_id: int | None
    login_grant_token_hash: str | None
    expires_at: datetime
    authenticated_at: datetime | None
    consumed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AgentEmailLoginChallenge(BaseModel):
    """Domain entity for one email login challenge."""

    model_config = ConfigDict(frozen=True)

    login_challenge_id: int
    email: str
    code_hash: str
    expires_at: datetime
    verified_at: datetime | None
    invalidated_at: datetime | None
    created_at: datetime
