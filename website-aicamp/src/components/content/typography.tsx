import type { ReactNode } from 'react'

/**
 * 课件排版原语 — 与站点主题 token 统一，无硬编码 hex（仅以 HTML class 或
 * Tailwind token 表达）。全部为纯服务端组件（无 'use client'）。
 */

/** 章节眉标：小字大写，字间距宽，静音色 */
export function Eyebrow({
  chapter,
  index,
  children,
}: {
  chapter?: string
  index?: string
  children?: ReactNode
}): React.JSX.Element {
  const text = children ?? [chapter, index].filter(Boolean).join(' · ')
  return (
    <p className="mb-[1.1rem] text-[0.78rem] uppercase tracking-[0.18em] text-muted">
      {text}
    </p>
  )
}

/**
 * 课件大标题（h1）— 渐变：accent → accent-2
 * 原 HTML: linear-gradient(100deg, #a78bfa 0%, #22d3ee 100%)
 */
export function LessonTitle({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <h1
      className="mb-[0.9rem] text-[2.4rem] font-bold leading-[1.25] tracking-[-0.02em]"
      style={{
        background: 'linear-gradient(100deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {children}
    </h1>
  )
}

/** 导语段落：稍大字号，静音色，限宽 62ch */
export function Lead({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <p className="mb-[0.4rem] max-w-[62ch] text-[1.08rem] text-muted">{children}</p>
  )
}

/**
 * 二级节块（h2 + 可选图标 + 内容区）
 * icon 对应 HTML 中的 .ico；标题对应 h2
 */
export function Section({
  id,
  icon,
  title,
  children,
}: {
  id?: string
  icon?: ReactNode
  title: ReactNode
  children: ReactNode
}): React.JSX.Element {
  return (
    <section id={id} className="mt-[2.8rem]">
      <h2 className="m-0 flex items-center gap-[0.62rem] text-[1.45rem] font-[650] leading-snug tracking-[-0.01em] text-ink">
        {icon && (
          <span className="inline-flex flex-none" aria-hidden="true">
            {icon}
          </span>
        )}
        {title}
      </h2>
      <div className="text-ink-soft">{children}</div>
    </section>
  )
}

/**
 * 要点清单（对应 .goals）
 * 每项用小圆点 bullet（currentColor 半透明）
 */
export function KeyPoints({
  title,
  items,
}: {
  title?: string
  items: ReactNode[]
}): React.JSX.Element {
  return (
    <div className="mt-[1.8rem]">
      {title && (
        <p className="m-0 text-[0.8rem] tracking-[0.14em] text-muted">{title}</p>
      )}
      <ul className="mt-[0.6rem] list-none p-0">
        {items.map((item, i) => (
          <li
            key={i}
            className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * 本节速读（对应 .toc）
 * items 为链接锚点文字列表，用 · 分隔
 */
export function Summary({
  title,
  items,
}: {
  title?: string
  items: ReactNode[]
}): React.JSX.Element {
  return (
    <p className="mt-[1.1rem] text-[0.86rem] leading-[2] text-muted">
      {title ?? '本节速览：'}
      {items.map((item, i) => (
        <span key={i}>
          {item}
          {i < items.length - 1 && <span className="mx-[0.35rem] opacity-50">·</span>}
        </span>
      ))}
    </p>
  )
}

/** 渐变分隔线（对应 .rule / hr.rule）*/
export function Rule(): React.JSX.Element {
  return (
    <hr
      className="my-[3.4rem] h-px border-0"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)',
      }}
    />
  )
}

/**
 * 行内渐变强调文字（对应 .gh）
 * 用于小标签："本节你会搞懂" 等
 */
export function Highlight({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <span
      style={{
        background: 'linear-gradient(100deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {children}
    </span>
  )
}

/**
 * 命令/行内代码样式（对应 code + .cmd 逻辑）
 * 块级命令盒子，左侧黄色强调线
 */
export function Cmd({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <pre
      className="mt-[1.1rem] overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.1)] border-l-2 p-[0.85rem_1.05rem] font-mono text-[0.86rem] leading-[1.95] text-ink"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderLeftColor: 'rgba(251,191,36,0.55)',
        whiteSpace: 'pre',
      }}
    >
      {children}
    </pre>
  )
}
