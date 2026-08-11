import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
  /** 页面级标题传 h1，板块标题用默认的 h2 */
  as?: 'h1' | 'h2'
  className?: string
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'center',
  as: Heading = 'h2',
  className = '',
}: SectionHeadingProps) => {
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-graphite-dim">
          {eyebrow}
        </span>
      )}
      {/* 宽度上限用 em 而非 ch：ch 是数字「0」的宽度（约 0.55em），
          对全角汉字严重低估，会让本该一行的中文标题折行并甩出孤字。 */}
      <Heading className="max-w-[22em] text-[clamp(1.75rem,3.6vw,2.75rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-graphite">
        {title}
      </Heading>
      {description && (
        <p className="mt-4 max-w-[30em] text-[15px] leading-[1.75] text-graphite-soft">
          {description}
        </p>
      )}
    </div>
  )
}
