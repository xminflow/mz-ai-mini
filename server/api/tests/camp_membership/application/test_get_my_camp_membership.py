from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.camp_membership.application import (
    GetMyCampMembershipQuery,
    GetMyCampMembershipUseCase,
)
from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSnapshot,
    CampMembershipTier,
)


class Repository:
    async def get_membership_snapshot(self, *, account_id: int, now: datetime) -> CampMembershipSnapshot:
        assert account_id == 3001
        return CampMembershipSnapshot(
            account_id=account_id,
            tier=CampMembershipTier.PREMIUM,
            started_at=datetime(2026, 1, 1),
            expires_at=datetime(2027, 1, 1),
            is_active=True,
            remaining_days=203,
        )


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 6, 12)


@pytest.mark.asyncio
async def test_get_my_camp_membership_returns_snapshot() -> None:
    use_case = GetMyCampMembershipUseCase(repository=Repository(), current_time_provider=Clock())

    result = await use_case.execute(GetMyCampMembershipQuery(account_id=3001))

    assert result.tier == CampMembershipTier.PREMIUM
    assert result.is_active is True
    assert result.remaining_days == 203
