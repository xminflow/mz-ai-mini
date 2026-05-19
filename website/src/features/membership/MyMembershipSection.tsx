import Link from 'next/link'

import type { MyMembershipResponse } from './types'

function formatDate(value: string | null): string {
  if (!value) return '未开通'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function resolveTitle(membership: MyMembershipResponse): string {
  if (membership.tier === 'none') return '尚未开通会员'
  if (!membership.is_active) return '会员已过期'
  if (membership.remaining_days <= 7) return `会员即将到期，还剩 ${membership.remaining_days} 天`
  return '年度会员有效中'
}

export function MyMembershipSection({ membership }: { membership: MyMembershipResponse }) {
  const title = resolveTitle(membership)
  const actionLabel =
    membership.tier === 'none' ? '了解年度会员' : membership.is_active ? '立即续费' : '重新开通'

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase text-accent-2">Account Membership</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          我的会员
        </h1>
        <p className="mt-5 text-base leading-8 text-ink-soft">
          {title}
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        <div className="rounded-[8px] border border-hairline bg-surface/80 p-5">
          <p className="text-sm text-muted">等级</p>
          <p className="mt-3 text-2xl font-semibold text-ink">
            {membership.tier === 'normal' ? '年度会员' : '未开通'}
          </p>
        </div>
        <div className="rounded-[8px] border border-hairline bg-surface/80 p-5">
          <p className="text-sm text-muted">开通时间</p>
          <p className="mt-3 text-lg font-medium text-ink">{formatDate(membership.started_at)}</p>
        </div>
        <div className="rounded-[8px] border border-hairline bg-surface/80 p-5">
          <p className="text-sm text-muted">到期时间</p>
          <p className="mt-3 text-lg font-medium text-ink">{formatDate(membership.expires_at)}</p>
        </div>
        <div className="rounded-[8px] border border-hairline bg-surface/80 p-5">
          <p className="text-sm text-muted">剩余天数</p>
          <p className="mt-3 text-2xl font-semibold text-ink">{membership.remaining_days}</p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center justify-center rounded-[6px] bg-ink px-5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          {actionLabel}
        </Link>
      </div>
    </section>
  )
}
