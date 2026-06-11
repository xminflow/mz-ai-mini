from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSnapshot,
    CampMembershipTier,
    CampMembershipTierRequiredException,
)
from mz_ai_backend.modules.camp_membership.presentation.dependencies import require_camp_tier


class _SnapshotUseCase:
    def __init__(self, snapshot: CampMembershipSnapshot) -> None:
        self._snapshot = snapshot

    async def execute(self, query) -> CampMembershipSnapshot:
        return self._snapshot


def _snapshot(*, tier: CampMembershipTier, is_active: bool) -> CampMembershipSnapshot:
    return CampMembershipSnapshot(
        account_id=3001,
        tier=tier,
        started_at=None,
        expires_at=datetime(2027, 1, 1) if is_active else None,
        is_active=is_active,
        remaining_days=365 if is_active else 0,
    )


@pytest.mark.asyncio
async def test_require_camp_tier_passes_when_active_tier_satisfies() -> None:
    dependency = require_camp_tier(CampMembershipTier.BASIC)
    snapshot = _snapshot(tier=CampMembershipTier.PREMIUM, is_active=True)

    tier = await dependency(account_id=3001, use_case=_SnapshotUseCase(snapshot))

    assert tier == CampMembershipTier.PREMIUM


@pytest.mark.asyncio
async def test_require_camp_tier_rejects_when_expired_falls_back_to_none() -> None:
    dependency = require_camp_tier(CampMembershipTier.BASIC)
    # 过期：有效等级回落 NONE，不满足 BASIC。
    snapshot = _snapshot(tier=CampMembershipTier.PREMIUM, is_active=False)

    with pytest.raises(CampMembershipTierRequiredException) as exc_info:
        await dependency(account_id=3001, use_case=_SnapshotUseCase(snapshot))

    # AppException 把 error_code 存为字符串（非枚举），故用字符串比较。
    assert exc_info.value.error_code == "CAMP_MEMBERSHIP.TIER_REQUIRED"
    assert exc_info.value.details == {"required": "basic", "current": "none"}


@pytest.mark.asyncio
async def test_require_camp_tier_rejects_when_tier_too_low() -> None:
    dependency = require_camp_tier(CampMembershipTier.PREMIUM)
    snapshot = _snapshot(tier=CampMembershipTier.BASIC, is_active=True)

    with pytest.raises(CampMembershipTierRequiredException):
        await dependency(account_id=3001, use_case=_SnapshotUseCase(snapshot))
