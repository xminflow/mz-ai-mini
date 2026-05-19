from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.account_membership.application import GetMyMembershipQuery, GetMyMembershipUseCase
from mz_ai_backend.modules.account_membership.domain import AccountMembershipSnapshot, MembershipTier


class Repository:
    async def get_membership_snapshot(self, *, account_id: int, now: datetime) -> AccountMembershipSnapshot:
        assert account_id == 2001
        return AccountMembershipSnapshot(
            account_id=account_id,
            tier=MembershipTier.NORMAL,
            started_at=datetime(2026, 1, 1),
            expires_at=datetime(2027, 1, 1),
            is_active=True,
            remaining_days=227,
        )


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 5, 18)


@pytest.mark.asyncio
async def test_get_my_membership_returns_snapshot() -> None:
    use_case = GetMyMembershipUseCase(repository=Repository(), current_time_provider=Clock())

    result = await use_case.execute(GetMyMembershipQuery(account_id=2001))

    assert result.tier == MembershipTier.NORMAL
    assert result.is_active is True
    assert result.remaining_days == 227
