import type { QuotaSnapshot } from '@/features/member-submissions/types'

type MembershipQuotaBadgeProps = {
  snapshot: QuotaSnapshot | null
  loading?: boolean
}

function formatPeriodEnd(value: string): string {
  const date = new Date(value)
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function MembershipQuotaBadge({ snapshot, loading = false }: MembershipQuotaBadgeProps) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/40 px-3 py-1 font-mono text-[11.5px] text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted/60" />
        配额查询中
      </span>
    )
  }

  if (snapshot === null) {
    return null
  }

  const exhausted = snapshot.remaining <= 0
  const resetLabel = formatPeriodEnd(snapshot.period_end)
  return (
    <span
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11.5px]',
        exhausted
          ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
          : 'border-hairline bg-surface/50 text-ink-soft',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          exhausted ? 'bg-rose-300' : 'bg-emerald-300',
        ].join(' ')}
      />
      本月剩 {snapshot.remaining}/{snapshot.limit} · {exhausted ? '重置于 ' : '重置 '}
      {resetLabel}
    </span>
  )
}
