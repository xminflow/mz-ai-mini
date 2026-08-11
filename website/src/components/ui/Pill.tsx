import type { ReactNode } from 'react'

type PillProps = {
  children: ReactNode
  className?: string
}

export const Pill = ({ children, className = '' }: PillProps) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full bg-paper-raised px-4 py-2 text-[13px] text-graphite-soft shadow-soft ${className}`}
  >
    {children}
  </span>
)
