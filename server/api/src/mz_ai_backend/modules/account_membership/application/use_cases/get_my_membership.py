from __future__ import annotations

from ..dtos import GetMyMembershipQuery, MyMembershipResult
from ..ports import AccountMembershipRepository, CurrentTimeProvider


class GetMyMembershipUseCase:
    """Return current website account membership snapshot."""

    def __init__(
        self,
        *,
        repository: AccountMembershipRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider

    async def execute(self, query: GetMyMembershipQuery) -> MyMembershipResult:
        return await self._repository.get_membership_snapshot(
            account_id=query.account_id,
            now=self._current_time_provider.now(),
        )
