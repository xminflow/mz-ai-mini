from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


NORMAL_MEMBERSHIP_DURATION_DAYS = 365
NORMAL_MEMBERSHIP_PRICE_FEN = 10


class MembershipTier(StrEnum):
    """Supported membership tiers."""

    NONE = "none"
    NORMAL = "normal"
    PLATINUM = "platinum"


class MembershipOrderStatus(StrEnum):
    """Supported membership order states."""

    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    CLOSED = "closed"


class UserMembershipSnapshot(BaseModel):
    """Membership snapshot of one user at query time."""

    model_config = ConfigDict(frozen=True)

    user_id: int
    openid: str
    tier: MembershipTier
    started_at: datetime | None
    expires_at: datetime | None
    is_active: bool


class MembershipOrder(BaseModel):
    """One persisted membership order aggregate."""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    user_id: int
    openid: str
    tier: MembershipTier
    amount_fen: int
    status: MembershipOrderStatus
    prepay_id: str | None
    transaction_id: str | None
    trade_state: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    notify_payload: str | None
    created_at: datetime
    updated_at: datetime
