// 极光背景：纯 CSS 模糊光球 + 缓慢漂移（auroraShift），无第三方动画依赖。
// 仅作装饰，绝对定位铺满父级（父级需 relative + overflow-hidden）。

type Orb = {
  color: string
  size: number
  blur: number
  opacity: number
  position: string
  delay: number
}

const ORBS: Orb[] = [
  { color: 'rgba(34, 211, 238, 0.55)', size: 460, blur: 120, opacity: 0.5, position: '-left-32 -top-32', delay: 0 },
  { color: 'rgba(99, 102, 241, 0.5)', size: 380, blur: 120, opacity: 0.45, position: '-right-24 top-6', delay: 1.4 },
  { color: 'rgba(56, 189, 248, 0.45)', size: 300, blur: 130, opacity: 0.4, position: 'left-1/3 top-1/2', delay: 0.7 },
]

export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {ORBS.map((orb, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${orb.position}`}
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle at 40% 40%, ${orb.color}, transparent 70%)`,
            filter: `blur(${orb.blur}px)`,
            opacity: orb.opacity,
            animation: 'auroraShift 16s ease-in-out infinite',
            animationDelay: `${orb.delay}s`,
            willChange: 'transform',
          }}
        />
      ))}
      {/* 底部渐隐到背景色，避免光球生硬截断 */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(to bottom, transparent 58%, var(--color-bg) 100%)' }}
      />
    </div>
  )
}
