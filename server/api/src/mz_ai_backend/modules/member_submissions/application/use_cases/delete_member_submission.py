"""Soft-delete one pending member submission owned by the current account.

业务规则：
- 仅允许工单所有者删除；通过 account_id 过滤实现越权防护。
- 仅 pending 状态可删；processing/done/rejected/cancelled 不允许，保留运营审计能力。
- 软删除（is_deleted=TRUE），不改 status，让后续运营报表可按需查询历史。
- 配额自动回退：count_consumed_in_period 已过滤 is_deleted=FALSE。
"""

from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import (
    MemberSubmissionNotDeletableException,
    MemberSubmissionNotFoundException,
    SubmissionStatus,
)
from ..dtos import DeleteMemberSubmissionCommand, DeleteMemberSubmissionResult
from ..ports import MemberSubmissionRepository


delete_logger = get_logger("mz_ai_backend.member_submissions.delete")


class DeleteMemberSubmissionUseCase:
    """Soft-delete one pending member submission ticket."""

    def __init__(
        self,
        *,
        repository: MemberSubmissionRepository,
    ) -> None:
        self._repository = repository

    async def execute(
        self,
        command: DeleteMemberSubmissionCommand,
    ) -> DeleteMemberSubmissionResult:
        submission = await self._repository.find_owned_by_id(
            submission_id=command.submission_id,
            account_id=command.account_id,
        )
        if submission is None:
            raise MemberSubmissionNotFoundException()
        if submission.status != SubmissionStatus.PENDING:
            raise MemberSubmissionNotDeletableException(
                current_status=submission.status.value,
            )

        deleted = await self._repository.mark_deleted(
            submission_id=command.submission_id,
            account_id=command.account_id,
        )
        if not deleted:
            # 在 find_owned_by_id 与 mark_deleted 之间被并发删了；语义等同于 not found。
            raise MemberSubmissionNotFoundException()

        delete_logger.info(
            "member_submission.deleted submission_id=%s account_id=%s type=%s",
            submission.submission_id,
            submission.account_id,
            submission.type.value,
        )

        return DeleteMemberSubmissionResult(
            submission_id=submission.submission_id,
            type=submission.type,
            deleted=True,
        )
