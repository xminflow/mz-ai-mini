from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import (
    SUBMISSION_QUOTA_LIMITS,
    MemberSubmissionInvalidPayloadException,
    MemberSubmissionMemberRequiredException,
    MemberSubmissionQuotaExhaustedException,
    SubmissionQuotaSnapshot,
    compute_period_bounds,
    compute_period_key,
)
from ..dtos import (
    CreateMemberSubmissionCommand,
    CreateMemberSubmissionResult,
    MemberSubmissionRegistration,
)
from ..ports import (
    CurrentTimeProvider,
    MemberSubmissionRepository,
    MembershipStatusReader,
    SnowflakeIdGenerator,
)


submissions_logger = get_logger("mz_ai_backend.member_submissions")


class CreateMemberSubmissionUseCase:
    """Create one member submission ticket."""

    def __init__(
        self,
        *,
        repository: MemberSubmissionRepository,
        membership_status_reader: MembershipStatusReader,
        snowflake_id_generator: SnowflakeIdGenerator,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._membership_status_reader = membership_status_reader
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider

    async def execute(
        self,
        command: CreateMemberSubmissionCommand,
    ) -> CreateMemberSubmissionResult:
        payload_text = command.payload_text.strip()
        if payload_text == "":
            raise MemberSubmissionInvalidPayloadException(
                message="Submission payload must not be blank.",
            )

        now = self._current_time_provider.now()

        # 校验当前账户是否仍是有效会员；防止会员到期后仍可提交。
        status = await self._membership_status_reader.get_status(
            account_id=command.account_id,
            now=now,
        )
        if not status.is_active:
            raise MemberSubmissionMemberRequiredException()

        period_key = compute_period_key(now)
        limit = SUBMISSION_QUOTA_LIMITS[command.type]
        consumed = await self._repository.count_consumed_in_period(
            account_id=command.account_id,
            submission_type=command.type,
            period_key=period_key,
        )
        if consumed >= limit:
            period_start, period_end = compute_period_bounds(period_key)
            raise MemberSubmissionQuotaExhaustedException(
                details={
                    "type": command.type.value,
                    "limit": limit,
                    "consumed": consumed,
                    "period_key": period_key,
                    "period_end": period_end.isoformat(),
                },
            )

        submission = await self._repository.create(
            registration=MemberSubmissionRegistration(
                submission_id=self._snowflake_id_generator.generate(),
                account_id=command.account_id,
                type=command.type,
                payload_text=payload_text,
                payload_meta=dict(command.payload_meta or {}),
                period_key=period_key,
                created_at=now,
            )
        )

        period_start, period_end = compute_period_bounds(period_key)
        quota_after = SubmissionQuotaSnapshot(
            type=command.type,
            period_key=period_key,
            period_start=period_start,
            period_end=period_end,
            limit=limit,
            consumed=consumed + 1,
            remaining=max(0, limit - consumed - 1),
        )

        submissions_logger.info(
            "member_submission.created submission_id=%s account_id=%s type=%s period_key=%s",
            submission.submission_id,
            submission.account_id,
            submission.type.value,
            submission.period_key,
        )

        return CreateMemberSubmissionResult(
            submission_id=submission.submission_id,
            type=submission.type,
            status=submission.status.value,
            period_key=submission.period_key,
            submitted_at=submission.created_at,
            quota_after=quota_after,
        )
