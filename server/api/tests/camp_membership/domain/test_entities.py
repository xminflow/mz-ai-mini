from __future__ import annotations

from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSku,
    CampMembershipTier,
    SKU_TIER_MAP,
    tier_satisfies,
)


def test_sku_tier_map_resolves_each_sku() -> None:
    assert SKU_TIER_MAP[CampMembershipSku.ANNUAL_BASIC] == CampMembershipTier.BASIC
    assert SKU_TIER_MAP[CampMembershipSku.ANNUAL_PREMIUM] == CampMembershipTier.PREMIUM


def test_tier_satisfies_orders_none_basic_premium() -> None:
    # 高档满足低档；同档满足；低档不满足高档
    assert tier_satisfies(CampMembershipTier.PREMIUM, CampMembershipTier.BASIC) is True
    assert tier_satisfies(CampMembershipTier.PREMIUM, CampMembershipTier.PREMIUM) is True
    assert tier_satisfies(CampMembershipTier.BASIC, CampMembershipTier.BASIC) is True
    assert tier_satisfies(CampMembershipTier.BASIC, CampMembershipTier.PREMIUM) is False
    assert tier_satisfies(CampMembershipTier.NONE, CampMembershipTier.BASIC) is False
    assert tier_satisfies(CampMembershipTier.PREMIUM, CampMembershipTier.NONE) is True
