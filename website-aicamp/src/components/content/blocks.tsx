import type { ReactNode } from 'react'

/**
 * 课件内容块 — 术语表 + 叙事/提示块（Callout）
 * 纯服务端组件，无 'use client'，无 any，无未用导入。
 */

/**
 * 术语表（对应 dl.terms）
 * 左列 term 粗白色，右列 gloss 灰色
 */
export function Terms({
  items,
}: {
  items: { term: string; gloss: ReactNode }[]
}): React.JSX.Element {
  return (
    <dl className="mt-[0.4rem]">
      {items.map(({ term, gloss }, i) => (
        <div
          key={i}
          className="grid gap-x-[1.6rem] gap-y-[0.3rem] border-t py-[0.72rem]"
          style={{
            gridTemplateColumns: '232px 1fr',
            borderTopColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <dt className="font-semibold text-ink">{term}</dt>
          <dd className="m-0 text-ink-soft">{gloss}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Callout tone → 左侧线色 + 背景微调 */
const toneStyles: Record<
  NonNullable<CalloutProps['tone']>,
  { border: string; label: string }
> = {
  analogy: {
    border: 'rgba(167,139,250,0.45)',   // accent/purple
    label: '比喻',
  },
  bridge: {
    border: 'rgba(34,211,238,0.35)',    // accent-2/cyan
    label: '过渡',
  },
  closing: {
    border: 'rgba(255,255,255,0.1)',    // hairline-strong
    label: '小结',
  },
  note: {
    border: 'rgba(251,191,36,0.45)',    // amber / terminal accent
    label: '备注',
  },
}

interface CalloutProps {
  tone?: 'analogy' | 'bridge' | 'closing' | 'note'
  label?: string
  id?: string // 锚点 id（供本节速读等页内跳转）
  children: ReactNode
}

/**
 * 叙事/提示块
 * - analogy  → 紫色左线（原 .analogy）
 * - bridge   → 青色左线（原 .bridge）
 * - closing  → 顶部细线，宽松上边距（原 .closing）
 * - note     → 琥珀左线（通用提示）
 */
export function Callout({ tone = 'analogy', label, id, children }: CalloutProps): React.JSX.Element {
  const style = toneStyles[tone]
  const displayLabel = label ?? style.label

  if (tone === 'closing') {
    return (
      <div
        id={id}
        className="mt-[3.4rem] pt-[2.2rem]"
        style={{ borderTop: `1px solid ${style.border}` }}
      >
        {label && (
          <p className="mb-[0.6rem] text-[0.78rem] uppercase tracking-[0.14em] text-muted">
            {displayLabel}
          </p>
        )}
        <div className="text-ink-soft">{children}</div>
      </div>
    )
  }

  if (tone === 'bridge') {
    // 用 <div> 而非 <p>：children 为 ReactNode，可能含块级元素，块级套 <p> 是非法 HTML
    return (
      <div
        id={id}
        className="mt-[1.8rem] text-[0.95rem] text-muted"
        style={{ borderLeft: `2px solid ${style.border}`, paddingLeft: '1rem' }}
      >
        {children}
      </div>
    )
  }

  // analogy / note — left-border block
  return (
    <div
      id={id}
      className="mt-[2.4rem]"
      style={{ paddingLeft: '1.2rem', borderLeft: `2px solid ${style.border}` }}
    >
      {label && (
        <p className="mb-[0.3rem] text-[0.75rem] uppercase tracking-[0.14em] text-muted">
          {displayLabel}
        </p>
      )}
      <div className="[&>p]:mt-[0.6rem] [&>p:first-child]:mt-0">{children}</div>
    </div>
  )
}
