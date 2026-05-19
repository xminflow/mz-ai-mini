'use client'

import { useEffect, useMemo, useState } from 'react'

import type { AuthState } from '@/features/auth/types'

import { getMyMembership } from './api'
import { MembershipPurchaseCard } from './MembershipPurchaseCard'
import type { MyMembershipResponse } from './types'

function resolveActionLabel(membership: MyMembershipResponse | null): string {
  if (!membership || membership.tier === 'none') return '立即开通'
  if (membership.is_active) return '立即续费'
  return '重新开通'
}

function resolveBanner(membership: MyMembershipResponse | null): string {
  if (!membership || membership.tier === 'none') return '年度会员适合持续跟踪案例、方法论和 AI 业务机会的团队。'
  if (!membership.is_active) return '你的会员已过期，重新开通后将从支付成功时间开始计算 365 天。'
  if (membership.remaining_days <= 30) return `你的会员还剩 ${membership.remaining_days} 天，续费后将在当前到期日基础上延长 365 天。`
  return `年度会员有效中，剩余 ${membership.remaining_days} 天。续费会自动延长当前有效期。`
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

  const actionLabel = useMemo(() => resolveActionLabel(membership), [membership])
  const banner = useMemo(() => resolveBanner(membership), [membership])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.68fr)] lg:items-start">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-2">
            Membership
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            年度会员
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">
            以年度订阅获取系统化案例拆解、内容增长方法论和 AI 业务机会追踪。支付成功后会员即时生效，续费会按当前有效期自动延长。
          </p>

          <div className="mt-8 rounded-[8px] border border-hairline bg-surface/65 px-4 py-3 text-sm leading-6 text-ink-soft">
            {banner}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['案例库持续更新', '方法论沉淀', '会员状态可追踪'].map((item) => (
              <div key={item} className="rounded-[8px] border border-hairline bg-surface/55 p-4">
                <p className="text-sm font-medium text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <MembershipPurchaseCard
          authState={authState}
          membership={membership}
          actionLabel={actionLabel}
        />
      </div>
    </section>
  )
}
