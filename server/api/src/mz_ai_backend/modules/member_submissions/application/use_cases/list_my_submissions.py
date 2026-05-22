from __future__ import annotations

from ..dtos import ListMySubmissionsQuery, MemberSubmissionsResult
from ..ports import CurrentTimeProvider, MemberSubmissionRepository
from ._quota import build_quota_snapshots


class ListMySubmissionsUseCase:
    """Return a page of submissions plus current quota snapshots."""

    def __init__(
        self,
        *,
        repository: MemberSubmissionRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider

    async def execute(self, query: ListMySubmissionsQuery) -> MemberSubmissionsResult:
        now = self._current_time_provider.now()
        items = await self._repository.list_by_account(
            account_id=query.account_id,
            submission_type=query.submission_type,
            limit=query.limit,
            offset=query.offset,
        )
        total = await self._repository.count_by_account(
            account_id=query.account_id,
            submission_type=query.submission_type,
        )
        snapshots = await build_quota_snapshots(
            repository=self._repository,
            account_id=query.account_id,
            now=now,
        )
        return MemberSubmissionsResult(
            items=items,
            total=total,
            limit=query.limit,
            offset=query.offset,
            quotas=snapshots,
        )
