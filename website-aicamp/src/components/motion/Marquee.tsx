import type { ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  speed?: number
  className?: string
}

export const Marquee = ({ children, speed = 40, className = '' }: MarqueeProps) => {
  return (
    <div
      className={`relative flex w-full overflow-hidden ${className}`}
      style={{
        maskImage:
          'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage:
          'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      <div
        className="flex shrink-0 items-center gap-12 pr-12"
        style={{
          animation: `marqueeScroll ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
