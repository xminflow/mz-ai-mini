from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.member_submissions.application import (
    CreateMemberSubmissionCommand,
    CreateMemberSubmissionUseCase,
    MemberSubmissionRegistration,
)
from mz_ai_backend.modules.member_submissions.application.ports import MembershipStatus
from mz_ai_backend.modules.member_submissions.domain import (
    MemberSubmission,
    MemberSubmissionInvalidPayloadException,
    MemberSubmissionMemberRequiredException,
    MemberSubmissionQuotaExhaustedException,
    SubmissionStatus,
    SubmissionType,
)


class FakeMemberSubmissionRepository:
    """In-memory repository stub controllable from each test case."""

    def __init__(
        self,
        *,
        consumed: int = 0,
    ) -> None:
        self.consumed = consumed
        self.created_registration: MemberSubmissionRegistration | None = None
        self.last_period_key: str | None = None

    async def create(self, registration: MemberSubmissionRegistration) -> MemberSubmission:
        self.created_registration = registration
        return MemberSubmission(
            submission_id=registration.submission_id,
            account_id=registration.account_id,
            type=registration.type,
            payload_text=registration.payload_text,
            payload_meta=registration.payload_meta,
            status=SubmissionStatus.PENDING,
            period_key=registration.period_key,
            processed_note=None,
            processed_at=None,
            created_at=registration.created_at,
            updated_at=registration.created_at,
        )

    async def count_consumed_in_period(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType,
        period_key: str,
    ) -> int:
        self.last_period_key = period_key
        return self.consumed

    async def list_by_account(self, **kwargs: object) -> list[MemberSubmission]:
        return []

    async def count_by_account(self, **kwargs: object) -> int:
        return 0


class StubMembershipStatusReader:
    def __init__(self, *, is_active: bool) -> None:
        self._is_active = is_active

    async def get_status(self, *, account_id: int, now: datetime) -> MembershipStatus:
        return MembershipStatus(
            account_id=account_id,
            is_active=self._is_active,
            expires_at=datetime(2027, 1, 1) if self._is_active else None,
        )


class StubSnowflakeIdGenerator:
    def __init__(self, value: int = 192758122237067264) -> None:
        self._value = value

    def generate(self) -> int:
        return self._value


class StubCurrentTimeProvider:
    def __init__(self, now: datetime) -> None:
        self._now = now

    def now(self) -> datetime:
        return self._now


def _build_use_case(
    *,
    repository: FakeMemberSubmissionRepository,
    is_active: bool = True,
    now: datetime | None = None,
) -> CreateMemberSubmissionUseCase:
    return CreateMemberSubmissionUseCase(
        repository=repository,
        membership_status_reader=StubMembershipStatusReader(is_active=is_active),
        snowflake_id_generator=StubSnowflakeIdGenerator(),
        current_time_provider=StubCurrentTimeProvider(
            now or datetime(2026, 5, 21, 10, 0, 0),
        ),
    )


def _blogger_command(account_id: int = 100001) -> CreateMemberSubmissionCommand:
    return CreateMemberSubmissionCommand(
        account_id=account_id,
        type=SubmissionType.BLOGGER,
        payload_text="https://www.douyin.com/user/MS4wLjABAAA",
        payload_meta={"source": "membership-page"},
    )


@pytest.mark.asyncio
async def test_create_first_submission_persists_with_natural_month_period() -> None:
    repository = FakeMemberSubmissionRepository(consumed=0)
    use_case = _build_use_case(
        repository=repository,
        now=datetime(2026, 5, 21, 10, 0, 0),
    )

    result = await use_case.execute(_blogger_command())

    assert result.submission_id == 192758122237067264
    assert result.type == SubmissionType.BLOGGER
    assert result.status == SubmissionStatus.PENDING.value
    assert result.period_key == "202605"
    assert result.quota_after.consumed == 1
    assert result.quota_after.remaining == 9
    assert repository.created_registration is not None
    assert repository.created_registration.period_key == "202605"


@pytest.mark.asyncio
async def test_create_submission_rejects_non_member_account() -> None:
    repository = FakeMemberSubmissionRepository()
    use_case = _build_use_case(repository=repository, is_active=False)

    with pytest.raises(MemberSubmissionMemberRequiredException):
        await use_case.execute(_blogger_command())

    assert repository.created_registration is None


@pytest.mark.asyncio
async def test_create_submission_allows_multiple_pending_of_same_type() -> None:
    # 业务规则：同一账号同一类型可同时存在多条 pending 工单，仅受月配额上限约束。
    # 仓库层应被直接调用，use case 不再做 active 检查。
    repository = FakeMemberSubmissionRepository(consumed=3)
    use_case = _build_use_case(repository=repository)

    result = await use_case.execute(_blogger_command())

    assert repository.created_registration is not None
    assert result.quota_after.consumed == 4
    assert result.quota_after.remaining == 6


@pytest.mark.asyncio
async def test_create_submission_rejects_when_quota_exhausted() -> None:
    repository = FakeMemberSubmissionRepository(consumed=10)
    use_case = _build_use_case(repository=repository)

    with pytest.raises(MemberSubmissionQuotaExhaustedException) as error:
        await use_case.execute(_blogger_command())

    details = error.value.details or {}
    assert details.get("limit") == 10
    assert details.get("consumed") == 10
    assert details.get("period_key") == "202605"
    assert details.get("period_end") == "2026-06-01T00:00:00"
    assert repository.created_registration is None


@pytest.mark.asyncio
async def test_create_submission_rejects_blank_payload() -> None:
    repository = FakeMemberSubmissionRepository()
    use_case = _build_use_case(repository=repository)

    blank_command = CreateMemberSubmissionCommand(
        account_id=100001,
        type=SubmissionType.BLOGGER,
        payload_text="   ",
        payload_meta={},
    )

    with pytest.raises(MemberSubmissionInvalidPayloadException):
        await use_case.execute(blank_command)


@pytest.mark.asyncio
async def test_create_submission_uses_correct_period_key_in_december_rollover() -> None:
    repository = FakeMemberSubmissionRepository()
    use_case = _build_use_case(
        repository=repository,
        now=datetime(2026, 12, 31, 23, 59, 59),
    )

    result = await use_case.execute(_blogger_command())

    assert result.period_key == "202612"
    assert result.quota_after.period_end == datetime(2027, 1, 1)


@pytest.mark.asyncio
async def test_create_submission_track_type_independent_quota() -> None:
    repository = FakeMemberSubmissionRepository(consumed=5)
    use_case = _build_use_case(repository=repository)

    track_command = CreateMemberSubmissionCommand(
        account_id=100001,
        type=SubmissionType.TRACK,
        payload_text="家政服务赛道",
        payload_meta={},
    )
    result = await use_case.execute(track_command)

    assert result.type == SubmissionType.TRACK
    assert result.quota_after.consumed == 6
    assert result.quota_after.remaining == 4
