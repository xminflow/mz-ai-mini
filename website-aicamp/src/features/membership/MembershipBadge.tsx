import type { AuthAccount } from '@/features/auth/types'
import { effectiveTier } from './require-tier'

const TIER_LABEL: Record<string, string> = {
  none: '普通',
  basic: '基础',
  premium: '高级',
}

function formatDate(value: string | null): string {
  if (!value) return ''
  const ts = value.endsWith('Z') || value.includes('+') ? value : `${value}Z`
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export function MembershipBadge({ account }: { account: AuthAccount }) {
  const tier = effectiveTier(account)
  const label = TIER_LABEL[tier] ?? '普通'
  const expiresAt = account.membership?.is_active ? account.membership.expires_at : null

  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
      <span
        className={[
          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
          tier === 'premium'
            ? 'border border-amber-300/40 bg-amber-300/10 text-amber-200'
            : tier === 'basic'
              ? 'border border-hairline bg-canvas/60 text-ink-soft'
              : 'border border-hairline bg-transparent text-muted',
        ].join(' ')}
      >
        {label}会员
      </span>
      {expiresAt && <span className="text-[11px] text-muted">{formatDate(expiresAt)} 到期</span>}
    </span>
  )
}
