from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class SubmissionType(StrEnum):
    """Supported member submission types."""

    BLOGGER = "blogger"
    TRACK = "track"


class SubmissionStatus(StrEnum):
    """Lifecycle states for a member submission ticket."""

    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


# 按会员等级区分的月度配额上限；key 与 account_membership.MembershipTier 值对应。
SUBMISSION_QUOTA_LIMITS: dict[str, dict[SubmissionType, int]] = {
    "normal": {SubmissionType.BLOGGER: 3, SubmissionType.TRACK: 3},
    "premium": {SubmissionType.BLOGGER: 10, SubmissionType.TRACK: 10},
}


class MemberSubmission(BaseModel):
    """Member submission ticket aggregate."""

    model_config = ConfigDict(frozen=True)

    submission_id: int
    account_id: int
    type: SubmissionType
    payload_text: str
    payload_meta: dict[str, object]
    status: SubmissionStatus
    period_key: str
    processed_note: str | None
    processed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class SubmissionQuotaSnapshot(BaseModel):
    """Quota snapshot for a single submission type within one period."""

    model_config = ConfigDict(frozen=True)

    type: SubmissionType
    period_key: str
    period_start: datetime
    period_end: datetime
    limit: int
    consumed: int
    remaining: int


def compute_period_key(reference: datetime) -> str:
    """Compute a YYYYMM natural-month period key from a naive UTC datetime."""

    return f"{reference.year:04d}{reference.month:02d}"


def compute_period_bounds(period_key: str) -> tuple[datetime, datetime]:
    """Compute the [start, end) datetime window for a YYYYMM period key."""

    if len(period_key) != 6 or not period_key.isdigit():
        raise ValueError("period_key must be a 6-digit YYYYMM string.")
    year = int(period_key[:4])
    month = int(period_key[4:6])
    if month < 1 or month > 12:
        raise ValueError("period_key month component is out of range.")
    start = datetime(year, month, 1)
    end = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
    return start, end
