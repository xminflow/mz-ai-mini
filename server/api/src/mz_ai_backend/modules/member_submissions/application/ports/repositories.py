from __future__ import annotations

from typing import Protocol

from ...domain import MemberSubmission, SubmissionType
from ..dtos import MemberSubmissionRegistration


class MemberSubmissionRepository(Protocol):
    """Contract for member submission persistence."""

    async def create(
        self,
        registration: MemberSubmissionRegistration,
    ) -> MemberSubmission:
        """Create one submission and return the persisted entity."""

    async def count_consumed_in_period(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType,
        period_key: str,
    ) -> int:
        """Count submissions that consume quota in the given period."""

    async def list_by_account(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType | None,
        limit: int,
        offset: int,
    ) -> list[MemberSubmission]:
        """Return a page of submissions for the account."""

    async def count_by_account(
        self,
        *,
        account_id: int,
        submission_type: SubmissionType | None,
    ) -> int:
        """Return the total submission count for the account."""

    async def find_owned_by_id(
        self,
        *,
        submission_id: int,
        account_id: int,
    ) -> MemberSubmission | None:
        """Return one active (not-yet-deleted) submission owned by the account."""

    async def mark_deleted(
        self,
        *,
        submission_id: int,
        account_id: int,
    ) -> bool:
        """Soft-delete one submission (is_deleted=TRUE). Returns False on no-op."""
