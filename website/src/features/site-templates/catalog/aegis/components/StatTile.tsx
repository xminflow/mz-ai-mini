import type { HealthStatus } from '../data'
import { DeltaTag, healthColor } from './StatusBadge'

/**
 * 指标卡。控制台里「一个数就是全部信息」的场合不该画图，用它。
 *
 * 数值刻意不加 tabular-nums：等宽数字在大字号下会显得松散，
 * 等宽只用在需要纵向对齐的表格与坐标轴刻度上。
 */
export function StatTile({
  label,
  value,
  unit,
  hint,
  delta,
  trend,
  tone,
  status,
}: {
  label: string
  value: string
  unit?: string
  hint?: string
  delta?: string
  trend?: 'up' | 'down' | 'flat'
  tone?: 'positive' | 'negative' | 'neutral'
  /** 给出时，卡片左侧显示一条状态色条 */
  status?: HealthStatus
}) {
  return (
    <div className="tpl-glass-card relative overflow-hidden rounded-xl px-4 py-3">
      {status ? (
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: healthColor(status) }}
          aria-hidden
        />
      ) : null}

      <p className="text-[12px] text-[var(--tpl-fg-dim)]">{label}</p>

      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[26px] font-semibold leading-none tracking-tight">{value}</span>
        {unit ? <span className="text-[13px] text-[var(--tpl-fg-dim)]">{unit}</span> : null}
        {delta && trend && tone ? (
          <span className="ml-auto">
            <DeltaTag delta={delta} trend={trend} tone={tone} />
          </span>
        ) : null}
      </div>

      {hint ? <p className="mt-2 text-[11px] leading-relaxed text-[var(--tpl-fg-faint)]">{hint}</p> : null}
    </div>
  )
}
