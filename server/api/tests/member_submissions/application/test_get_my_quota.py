from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.member_submissions.application import (
    GetMyQuotaQuery,
    GetMyQuotaUseCase,
)
from mz_ai_backend.modules.member_submissions.domain import (
    MemberSubmission,
    SubmissionType,
)


class StubRepository:
    def __init__(self, *, consumed_by_type: dict[SubmissionType, int]) -> None:
        self.consumed_by_type = consumed_by_type
        self.calls: list[tuple[SubmissionType, str]] = []

    async def count_consumed_in_period(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType,
        period_key: str,
    ) -> int:
        self.calls.append((submission_type, period_key))
        return self.consumed_by_type.get(submission_type, 0)

    async def create(self, **_: object) -> MemberSubmission:
        raise AssertionError("create should not be called by quota use case")

    async def list_by_account(self, **_: object) -> list[MemberSubmission]:
        return []

    async def count_by_account(self, **_: object) -> int:
        return 0


class StubTimeProvider:
    def __init__(self, now: datetime) -> None:
        self._now = now

    def now(self) -> datetime:
        return self._now


@pytest.mark.asyncio
async def test_returns_snapshot_for_every_submission_type() -> None:
    repository = StubRepository(
        consumed_by_type={SubmissionType.BLOGGER: 3, SubmissionType.TRACK: 0},
    )
    use_case = GetMyQuotaUseCase(
        repository=repository,
        current_time_provider=StubTimeProvider(datetime(2026, 5, 21, 10, 0, 0)),
    )

    result = await use_case.execute(GetMyQuotaQuery(account_id=100001))

    assert len(result.quotas) == 2
    by_type = {q.type: q for q in result.quotas}
    assert by_type[SubmissionType.BLOGGER].consumed == 3
    assert by_type[SubmissionType.BLOGGER].remaining == 7
    assert by_type[SubmissionType.TRACK].consumed == 0
    assert by_type[SubmissionType.TRACK].remaining == 10
    for snapshot in result.quotas:
        assert snapshot.period_key == "202605"
        assert snapshot.period_start == datetime(2026, 5, 1)
        assert snapshot.period_end == datetime(2026, 6, 1)


@pytest.mark.asyncio
async def test_queries_period_key_for_current_month_only() -> None:
    repository = StubRepository(consumed_by_type={})
    use_case = GetMyQuotaUseCase(
        repository=repository,
        current_time_provider=StubTimeProvider(datetime(2026, 7, 5, 10, 0, 0)),
    )

    await use_case.execute(GetMyQuotaQuery(account_id=42))

    for _submission_type, period_key in repository.calls:
        assert period_key == "202607"
