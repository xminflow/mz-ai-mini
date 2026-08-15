import type { ReactNode } from 'react'

/**
 * 面板容器：控制台里所有分区的统一外壳（白底 + 1px 描边 + 圆角）。
 * 标题行是可选的，因为部分分区（如日志流）需要自己接管头部。
 */
export function Panel({
  title,
  hint,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string
  hint?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={`tpl-glass-panel overflow-hidden rounded-xl ${className ?? ''}`}
    >
      {title ? (
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--tpl-rule)] px-4 py-3">
          <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
          {hint ? <span className="text-[11px] text-[var(--tpl-fg-faint)]">{hint}</span> : null}
          {action ? <div className="ml-auto shrink-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={bodyClassName ?? 'p-4'}>{children}</div>
    </section>
  )
}

/** 面板右上角的次级说明/图例位。 */
export function PanelLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-[11px] text-[var(--tpl-fg-dim)]">
          <span className="inline-block size-2 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden />
          {item.label}
        </span>
      ))}
    </div>
  )
}
