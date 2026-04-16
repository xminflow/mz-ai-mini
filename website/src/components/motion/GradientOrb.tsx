import type { CSSProperties } from 'react'

interface GradientOrbProps {
  className?: string
  style?: CSSProperties
  color?: 'violet' | 'cyan' | 'pink' | 'mixed'
  size?: number
  blur?: number
  opacity?: number
}

const GRADIENTS: Record<NonNullable<GradientOrbProps['color']>, string> = {
  violet:
    'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.85), rgba(139,92,246,0.4) 45%, transparent 70%)',
  cyan:
    'radial-gradient(circle at 40% 40%, rgba(34,211,238,0.7), rgba(14,165,233,0.35) 45%, transparent 70%)',
  pink:
    'radial-gradient(circle at 35% 35%, rgba(244,114,182,0.8), rgba(236,72,153,0.4) 45%, transparent 70%)',
  mixed:
    'conic-gradient(from 120deg at 50% 50%, rgba(167,139,250,0.75), rgba(34,211,238,0.55), rgba(244,114,182,0.65), rgba(167,139,250,0.75))',
}

export const GradientOrb = ({
  className = '',
  style,
  color = 'violet',
  size = 520,
  blur = 110,
  opacity = 0.7,
}: GradientOrbProps) => {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: GRADIENTS[color],
        filter: `blur(${blur}px)`,
        opacity,
        animation: 'auroraShift 14s ease-in-out infinite',
        willChange: 'transform',
        ...style,
      }}
    />
  )
}
