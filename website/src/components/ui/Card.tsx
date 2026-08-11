import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  interactive?: boolean
}

// 全站唯一的卡片规格。interactive 时 hover 微抬一档，阴影只在 shadow-soft / shadow-soft-lg 之间切换。
export const Card = ({ children, className = '', interactive = false }: CardProps) => (
  <div
    className={[
      'rounded-card bg-paper-raised p-6 shadow-soft',
      interactive
        ? 'transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-soft-lg'
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
)
