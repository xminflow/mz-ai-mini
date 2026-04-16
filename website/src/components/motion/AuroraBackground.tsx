import { GradientOrb } from './GradientOrb'

interface AuroraBackgroundProps {
  variant?: 'hero' | 'section' | 'subtle'
}

export const AuroraBackground = ({ variant = 'section' }: AuroraBackgroundProps) => {
  if (variant === 'hero') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <GradientOrb color="violet" size={720} blur={140} opacity={0.55} className="-left-40 -top-40" />
        <GradientOrb color="cyan" size={560} blur={130} opacity={0.45} className="-right-32 top-20" />
        <GradientOrb color="pink" size={480} blur={140} opacity={0.35} className="left-1/3 top-1/2" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 65%, rgba(5,5,7,0.9) 100%)',
          }}
        />
      </div>
    )
  }

  if (variant === 'subtle') {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <GradientOrb color="violet" size={420} blur={120} opacity={0.3} className="-left-20 top-10" />
        <GradientOrb color="cyan" size={360} blur={120} opacity={0.22} className="right-0 bottom-0" />
      </div>
    )
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <GradientOrb color="mixed" size={620} blur={140} opacity={0.42} className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
  )
}
