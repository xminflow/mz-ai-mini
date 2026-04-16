import type { ElementType, ReactNode } from 'react'

interface GradientTextProps {
  as?: ElementType
  children: ReactNode
  className?: string
  animated?: boolean
}

export const GradientText = ({
  as: Tag = 'span',
  children,
  className = '',
  animated = true,
}: GradientTextProps) => {
  return (
    <Tag
      className={`text-gradient ${className}`}
      style={
        animated
          ? {
              animation: 'shimmerText 8s linear infinite',
            }
          : undefined
      }
    >
      {children}
    </Tag>
  )
}
