import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
  className?: string
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'center',
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
      <h2 className="max-w-[24ch] text-[clamp(1.75rem,3.6vw,2.75rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-graphite">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.75] text-graphite-soft">
          {description}
        </p>
      )}
    </div>
  )
}
