from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class CampAccountStatus(StrEnum):
    """Supported account statuses for camp authentication."""

    ACTIVE = "active"
    DISABLED = "disabled"


class CampWechatSubscribeStatus(StrEnum):
    """Supported subscribe states for one official account identity."""

    SUBSCRIBED = "subscribed"
    UNSUBSCRIBED = "unsubscribed"


class CampWechatLoginSessionStatus(StrEnum):
    """Supported statuses for one QR login session."""

    PENDING = "pending"
    AUTHENTICATED = "authenticated"
    EXPIRED = "expired"
    CONSUMED = "consumed"


class CampAccount(BaseModel):
    """Domain entity for one camp account."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None
    status: CampAccountStatus
    # 报名/会员状态（none/enrolled/expired）；camp 无密码登录，故不含 password 字段
    enrollment_status: str
    enrolled_at: datetime | None
    enrollment_expires_at: datetime | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class CampAuthSession(BaseModel):
    """Domain entity for one refreshable login session."""

    model_config = ConfigDict(frozen=True)

    session_id: int
    account_id: int
    refresh_token_hash: str
    expires_at: datetime
    revoked_at: datetime | None
    created_at: datetime
    updated_at: datetime


class CampAccessTokenRecord(BaseModel):
    """Domain entity for one issued access token."""

    model_config = ConfigDict(frozen=True)

    token_id: int
    session_id: int
    access_token_hash: str
    expires_at: datetime
    created_at: datetime


class CampWechatIdentity(BaseModel):
    """Domain entity for one official account identity binding."""

    model_config = ConfigDict(frozen=True)

    identity_id: int
    account_id: int
    official_openid: str
    subscribe_status: CampWechatSubscribeStatus
    subscribed_at: datetime | None
    unsubscribed_at: datetime | None
    last_event_at: datetime | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class CampWechatLoginSession(BaseModel):
    """Domain entity for one QR login session."""

    model_config = ConfigDict(frozen=True)

    login_session_id: int
    scene_key: str
    status: CampWechatLoginSessionStatus
    official_openid: str | None
    account_id: int | None
    login_grant_token_hash: str | None
    expires_at: datetime
    authenticated_at: datetime | None
    consumed_at: datetime | None
    created_at: datetime
    updated_at: datetime
