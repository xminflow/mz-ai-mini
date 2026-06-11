import type { AuthAccount, CampMembershipTier } from '@/features/auth/types'

const TIER_ORDER: Record<CampMembershipTier, number> = {
  none: 0,
  basic: 1,
  premium: 2,
}

/** 账号「有效等级」：会员存在且 is_active 才取其 tier，否则回落 none。 */
export function effectiveTier(account: AuthAccount | null): CampMembershipTier {
  const m = account?.membership
  if (!m || !m.is_active) return 'none'
  return m.tier
}

/** 当前账号有效等级是否满足所需等级（高档满足低档）。 */
export function requireTier(account: AuthAccount | null, required: CampMembershipTier): boolean {
  return TIER_ORDER[effectiveTier(account)] >= TIER_ORDER[required]
}
