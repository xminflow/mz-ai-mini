from __future__ import annotations

from ..dtos import GetMyQuotaQuery, MyQuotaResult
from ..ports import CurrentTimeProvider, MemberSubmissionRepository, MembershipStatusReader
from ._quota import build_quota_snapshots


class GetMyQuotaUseCase:
    """Return the current account's quota snapshots for the active period."""

    def __init__(
        self,
        *,
        repository: MemberSubmissionRepository,
        membership_status_reader: MembershipStatusReader,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._membership_status_reader = membership_status_reader
        self._current_time_provider = current_time_provider

    async def execute(self, query: GetMyQuotaQuery) -> MyQuotaResult:
        now = self._current_time_provider.now()
        status = await self._membership_status_reader.get_status(
            account_id=query.account_id,
            now=now,
        )
        snapshots = await build_quota_snapshots(
            repository=self._repository,
            account_id=query.account_id,
            now=now,
            tier=status.tier,
        )
        return MyQuotaResult(quotas=snapshots)
