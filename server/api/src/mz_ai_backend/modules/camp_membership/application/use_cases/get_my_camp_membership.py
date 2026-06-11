from __future__ import annotations

from ..dtos import GetMyCampMembershipQuery, MyCampMembershipResult
from ..ports import CampMembershipRepository, CurrentTimeProvider


class GetMyCampMembershipUseCase:
    """返回当前 ai-camp 账号会员快照。"""

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider

    async def execute(self, query: GetMyCampMembershipQuery) -> MyCampMembershipResult:
        return await self._repository.get_membership_snapshot(
            account_id=query.account_id,
            now=self._current_time_provider.now(),
        )
