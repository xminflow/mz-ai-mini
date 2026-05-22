from __future__ import annotations

from ..dtos import GetMyQuotaQuery, MyQuotaResult
from ..ports import CurrentTimeProvider, MemberSubmissionRepository
from ._quota import build_quota_snapshots


class GetMyQuotaUseCase:
    """Return the current account's quota snapshots for the active period."""

    def __init__(
        self,
        *,
        repository: MemberSubmissionRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider

    async def execute(self, query: GetMyQuotaQuery) -> MyQuotaResult:
        snapshots = await build_quota_snapshots(
            repository=self._repository,
            account_id=query.account_id,
            now=self._current_time_provider.now(),
        )
        return MyQuotaResult(quotas=snapshots)
