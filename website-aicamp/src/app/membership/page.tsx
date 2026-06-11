import type { Metadata } from 'next'

import { getCampAuthState } from '@/features/auth/server/session'
import { MembershipPurchasePanel } from '@/features/membership/MembershipPurchasePanel'
import type { MyCampMembershipResponse } from '@/features/membership/types'

export const metadata: Metadata = {
  title: '开通会员 · 微域生光',
}

export const dynamic = 'force-dynamic'

export default async function MembershipPage() {
  const authState = await getCampAuthState()
  // 登录态里已含 membership（camp_auth /me 带回），直接用，避免再发一次请求。
  const membership: MyCampMembershipResponse | null = authState.authenticated
    ? authState.account.membership
      ? {
          tier: authState.account.membership.tier,
          started_at: null,
          expires_at: authState.account.membership.expires_at,
          is_active: authState.account.membership.is_active,
          remaining_days: authState.account.membership.remaining_days,
        }
      : null
    : null

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">选择你的会员等级</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        基础档覆盖零基础 AI 编程；高级档包含基础全部并进阶到 AI 编程专家。一年有效期，微信扫码支付。
      </p>
      <div className="mt-10">
        <MembershipPurchasePanel
          authenticated={authState.authenticated}
          membership={membership}
        />
      </div>
    </section>
  )
}
