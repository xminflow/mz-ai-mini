from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class UserStatus(StrEnum):
    """Supported user statuses."""

    ACTIVE = "active"
    DISABLED = "disabled"


class UserMembershipTier(StrEnum):
    """Supported user membership tiers."""

    NONE = "none"
    NORMAL = "normal"
    PLATINUM = "platinum"


class User(BaseModel):
    """Auth domain user entity."""

    model_config = ConfigDict(frozen=True)

    user_id: int
    openid: str
    union_id: str | None
    nickname: str | None
    avatar_url: str | None
    status: UserStatus
    membership_tier: UserMembershipTier = UserMembershipTier.NONE
    membership_started_at: datetime | None = None
    membership_expires_at: datetime | None = None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
