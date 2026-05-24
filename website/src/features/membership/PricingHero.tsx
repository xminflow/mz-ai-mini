'use client'

import { useEffect, useMemo, useState } from 'react'

import type { AuthState } from '@/features/auth/types'

import { getMyMembership } from './api'
import { MembershipPurchaseCard } from './MembershipPurchaseCard'
import type { MyMembershipResponse } from './types'

const NORMAL_FEATURES = [
  '定制博主拆解报告（每月 3 份）',
  '定制赛道分析报告（每月 3 份）',
  '开通全量分析报告资料库（每日更新）',
  '方法论文档持续更新',
]

const PREMIUM_FEATURES = [
  '定制博主拆解报告（每月 10 份）',
  '定制赛道分析报告（每月 10 份）',
  '开通全量分析报告资料库（每日更新）',
  '方法论文档持续更新',
  '本地采集智能体工具（联系客服获取）',
]

function resolveActionLabel(
  membership: MyMembershipResponse | null,
  targetTier: 'normal' | 'premium',
): string {
  if (!membership || membership.tier === 'none') return '立即开通'
  if (membership.tier === targetTier && membership.is_active) return '立即续费'
  if (membership.tier === 'normal' && targetTier === 'premium') return '升级高级会员'
  if (!membership.is_active) return '重新开通'
  return '立即开通'
}

function resolveBanner(membership: MyMembershipResponse | null): string {
  if (!membership || membership.tier === 'none')
    return '年度会员适合持续跟踪案例、方法论和 AI 业务机会的团队。'
  if (!membership.is_active)
    return '你的会员已过期，重新开通后将从支付成功时间开始计算 365 天。'
  if (membership.remaining_days <= 30)
    return `你的会员还剩 ${membership.remaining_days} 天，续费后将在当前到期日基础上延长 365 天。`
  const tierName = membership.tier === 'premium' ? '高级会员' : '普通会员'
  return `${tierName}有效中，剩余 ${membership.remaining_days} 天。续费会自动延长当前有效期。`
}

export function PricingHero() {
  const [authState, setAuthState] = useState<AuthState | null>(null)
  const [membership, setMembership] = useState<MyMembershipResponse | null>(null)

  useEffect(() => {
    let active = true

    const loadState = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) return
        const payload = (await response.json()) as { state: AuthState }
        if (!active) return
        setAuthState(payload.state)
        if (payload.state.authenticated) {
          try {
            setMembership(await getMyMembership())
          } catch (membershipError) {
            console.error({ scope: 'membership', endpoint: 'me', error: membershipError })
          }
        }
      } catch (loadError) {
        console.error({ scope: 'membership', endpoint: 'auth_state', error: loadError })
        if (active) setAuthState({ authenticated: false, reason: 'missing_session' })
      }
    }

    void loadState()
    return () => {
      active = false
    }
  }, [])

  const banner = useMemo(() => resolveBanner(membership), [membership])
  const normalActionLabel = useMemo(() => resolveActionLabel(membership, 'normal'), [membership])
  const premiumActionLabel = useMemo(() => resolveActionLabel(membership, 'premium'), [membership])

  // 仅在当前等级卡片上展示会员状态
  const normalMembership = membership?.tier === 'normal' ? membership : null
  const premiumMembership = membership?.tier === 'premium' ? membership : null

  // NORMAL 有效会员升级时，按剩余天数折算差价（与后端逻辑保持一致）
  const premiumPriceYuan = useMemo(() => {
    if (membership?.tier === 'normal' && membership.is_active) {
      const creditFen = Math.round(19900 * membership.remaining_days / 365)
      return Math.max(1, Math.ceil((49900 - creditFen) / 100))
    }
    return 499
  }, [membership])

  const premiumPriceNote = membership?.tier === 'normal' && membership.is_active
    ? `升级差价（原价 ¥499，已折算剩余 ${membership.remaining_days} 天普通会员价值）`
    : undefined

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-2">Membership</p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          年度会员
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">
          以年度订阅获取系统化案例拆解、内容增长方法论和 AI 业务机会追踪。支付成功后会员即时生效，续费会按当前有效期自动延长。
        </p>
        <div className="mt-6 rounded-[8px] border border-hairline bg-surface/65 px-4 py-3 text-sm leading-6 text-ink-soft">
          {banner}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:items-start">
        <MembershipPurchaseCard
          authState={authState}
          membership={normalMembership}
          actionLabel={normalActionLabel}
          sku="annual_normal"
          priceYuan={199}
          tierLabel="普通会员"
          features={NORMAL_FEATURES}
          showStatus={membership?.tier === 'normal'}
          locked={membership?.tier === 'premium' && membership.is_active}
          lockedNote="当前为高级会员，已包含此档全部权益"
        />
        <MembershipPurchaseCard
          authState={authState}
          membership={premiumMembership}
          actionLabel={premiumActionLabel}
          sku="annual_premium"
          priceYuan={premiumPriceYuan}
          priceNote={premiumPriceNote}
          tierLabel="高级会员"
          features={PREMIUM_FEATURES}
          showStatus={membership?.tier === 'premium'}
        />
      </div>
    </section>
  )
}
