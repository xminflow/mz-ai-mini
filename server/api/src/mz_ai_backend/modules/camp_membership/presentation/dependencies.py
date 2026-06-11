from __future__ import annotations

from typing import Annotated, Callable

from fastapi import Depends

from ..application import GetMyCampMembershipQuery, GetMyCampMembershipUseCase
from ..domain import (
    CampMembershipTier,
    CampMembershipTierRequiredException,
    tier_satisfies,
)
from ..infrastructure import (
    get_current_camp_account_id,
    get_get_my_camp_membership_use_case,
)


def require_camp_tier(
    required_tier: CampMembershipTier,
) -> Callable[..., "CampMembershipTier"]:
    """构造一个 FastAPI 依赖：要求当前账号有效等级 >= required_tier。

    将来课件接口只需 ``Depends(require_camp_tier(CampMembershipTier.BASIC))``。
    过期会员有效等级回落 NONE；不满足时抛 CAMP_MEMBERSHIP.TIER_REQUIRED（含 required/current），
    不静默兜底。
    """

    async def _dependency(
        account_id: Annotated[int, Depends(get_current_camp_account_id)],
        use_case: Annotated[
            GetMyCampMembershipUseCase,
            Depends(get_get_my_camp_membership_use_case),
        ],
    ) -> CampMembershipTier:
        snapshot = await use_case.execute(GetMyCampMembershipQuery(account_id=account_id))
        # 过期 → 有效等级回落 NONE；有效 → 取快照 tier。
        effective_tier = snapshot.tier if snapshot.is_active else CampMembershipTier.NONE
        if not tier_satisfies(effective_tier, required_tier):
            raise CampMembershipTierRequiredException(
                required=required_tier,
                current=effective_tier,
            )
        return effective_tier

    return _dependency
