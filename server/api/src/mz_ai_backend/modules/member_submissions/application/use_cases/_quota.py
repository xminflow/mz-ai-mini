from __future__ import annotations

from datetime import datetime

from ...domain import (
    SUBMISSION_QUOTA_LIMITS,
    SubmissionQuotaSnapshot,
    SubmissionType,
    compute_period_bounds,
    compute_period_key,
)
from ..ports import MemberSubmissionRepository


async def build_quota_snapshots(
    *,
    repository: MemberSubmissionRepository,
    account_id: int,
    now: datetime,
) -> list[SubmissionQuotaSnapshot]:
    """Build quota snapshots for every supported submission type for `now`."""

    period_key = compute_period_key(now)
    period_start, period_end = compute_period_bounds(period_key)
    snapshots: list[SubmissionQuotaSnapshot] = []
    for submission_type in SubmissionType:
        limit = SUBMISSION_QUOTA_LIMITS[submission_type]
        consumed = await repository.count_consumed_in_period(
            account_id=account_id,
            submission_type=submission_type,
            period_key=period_key,
        )
        snapshots.append(
            SubmissionQuotaSnapshot(
                type=submission_type,
                period_key=period_key,
                period_start=period_start,
                period_end=period_end,
                limit=limit,
                consumed=consumed,
                remaining=max(0, limit - consumed),
            )
        )
    return snapshots
