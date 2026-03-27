from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class UserStatus(StrEnum):
    """Supported user statuses."""

    ACTIVE = "active"
    DISABLED = "disabled"


class User(BaseModel):
    """Auth domain user entity."""

    model_config = ConfigDict(frozen=True)

    user_id: int
    openid: str
    union_id: str | None
    nickname: str | None
    avatar_url: str | None
    status: UserStatus
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
