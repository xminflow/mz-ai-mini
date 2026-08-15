import type { AlertSeverity, HealthStatus } from '../data'

/**
 * 状态语义的统一出口。健康度与告警严重度是这套界面的核心语义，
 * 颜色映射必须只此一处，散落到各页去写会立刻走形。
 */

const HEALTH_TOKEN: Record<HealthStatus, { color: string; soft: string; label: string }> = {
  healthy: { color: 'var(--tpl-ok)', soft: 'var(--tpl-ok-soft)', label: '正常' },
  warning: { color: 'var(--tpl-warn)', soft: 'var(--tpl-warn-soft)', label: '警告' },
  critical: { color: 'var(--tpl-crit)', soft: 'var(--tpl-crit-soft)', label: '异常' },
}

const SEVERITY_TOKEN: Record<AlertSeverity, { color: string; soft: string; label: string }> = {
  critical: { color: 'var(--tpl-crit)', soft: 'var(--tpl-crit-soft)', label: '严重' },
  warning: { color: 'var(--tpl-warn)', soft: 'var(--tpl-warn-soft)', label: '警告' },
  info: { color: 'var(--tpl-accent)', soft: 'var(--tpl-accent-soft)', label: '提示' },
}

export function healthColor(status: HealthStatus): string {
  return HEALTH_TOKEN[status].color
}

/** 存活指示点。正常态带呼吸动画表达「实时」，异常态静止以免干扰阅读。 */
export function StatusDot({ status, size = 8 }: { status: HealthStatus; size?: number }) {
  const token = HEALTH_TOKEN[status]
  return (
    <span
      className={status === 'healthy' ? 'tpl-pulse inline-block shrink-0 rounded-full' : 'inline-block shrink-0 rounded-full'}
      style={{ width: size, height: size, backgroundColor: token.color }}
      role="img"
      aria-label={token.label}
    />
  )
}

export function HealthBadge({ status, text }: { status: HealthStatus; text?: string }) {
  const token = HEALTH_TOKEN[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: token.soft, color: token.color }}
    >
      <StatusDot status={status} size={6} />
      {text ?? token.label}
    </span>
  )
}

export function SeverityBadge({ severity, text }: { severity: AlertSeverity; text?: string }) {
  const token = SEVERITY_TOKEN[severity]
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: token.soft, color: token.color }}
    >
      {text ?? token.label}
    </span>
  )
}

/** 严重度的左侧色条，用在表格行首，比整行染色克制得多。 */
export function SeverityBar({ severity }: { severity: AlertSeverity }) {
  return (
    <span
      className="inline-block h-4 w-[3px] shrink-0 rounded-full"
      style={{ backgroundColor: SEVERITY_TOKEN[severity].color }}
      aria-hidden
    />
  )
}

/** 指标环比变化。tone 表达「这个方向对业务是好是坏」，与涨跌方向解耦。 */
export function DeltaTag({
  delta,
  trend,
  tone,
}: {
  delta: string
  trend: 'up' | 'down' | 'flat'
  tone: 'positive' | 'negative' | 'neutral'
}) {
  const color =
    tone === 'positive' ? 'var(--tpl-ok)' : tone === 'negative' ? 'var(--tpl-crit)' : 'var(--tpl-fg-dim)'
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '·'
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium" style={{ color }}>
      <span aria-hidden>{arrow}</span>
      {delta}
    </span>
  )
}
