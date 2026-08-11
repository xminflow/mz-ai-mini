import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  interactive?: boolean
  /** 内边距做成参数而不是让调用方用 className 覆盖：同优先级的 Tailwind 类互相覆盖不可靠 */
  padClass?: string
}

// 全站唯一的卡片规格。interactive 时 hover 微抬一档，阴影只在 shadow-soft / shadow-soft-lg 之间切换。
export const Card = ({
  children,
  className = '',
  interactive = false,
  padClass = 'p-6',
}: CardProps) => (
  <div
    className={[
      `rounded-card bg-paper-raised ${padClass} shadow-soft`,
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
