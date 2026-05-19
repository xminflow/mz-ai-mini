from __future__ import annotations

from datetime import datetime, timedelta
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


ACCOUNT_MEMBERSHIP_DURATION_DAYS = 365
MEMBERSHIP_QR_TTL_SECONDS = 15 * 60


class MembershipTier(StrEnum):
    """Supported website account membership tiers."""

    NONE = "none"
    NORMAL = "normal"


class MembershipSku(StrEnum):
    """Supported website account membership SKUs."""

    ANNUAL_NORMAL = "annual_normal"


class OrderStatus(StrEnum):
    """Supported website account membership order statuses."""

    PENDING = "pending"
    PAID = "paid"
    CLOSED = "closed"


class AccountMembershipSnapshot(BaseModel):
    """Membership snapshot persisted on one website account."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    tier: MembershipTier
    started_at: datetime | None
    expires_at: datetime | None
    is_active: bool
    remaining_days: int


class AccountMembershipOrder(BaseModel):
    """One website account membership order aggregate."""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    account_id: int
    sku: MembershipSku
    amount_fen: int
    status: OrderStatus
    code_url: str | None
    transaction_id: str | None
    trade_state: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    last_wechat_query_at: datetime | None
    notify_payload: str | None
    created_at: datetime
    updated_at: datetime


def calculate_membership_period(
    *,
    current_started_at: datetime | None,
    current_expires_at: datetime | None,
    paid_at: datetime,
    now: datetime,
) -> tuple[datetime, datetime]:
    """Calculate membership period for first purchase and renewal."""

    # 续费必须基于锁定后的账号快照计算，避免并发支付把同一段有效期重复覆盖。
    if current_expires_at is not None and current_expires_at > now:
        started_at = current_started_at or paid_at
        expires_at = current_expires_at + timedelta(days=ACCOUNT_MEMBERSHIP_DURATION_DAYS)
        return started_at, expires_at

    return paid_at, paid_at + timedelta(days=ACCOUNT_MEMBERSHIP_DURATION_DAYS)
