'use client'

import { motion } from 'framer-motion'

export const ArrowRight = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
  </svg>
)

export const SectionEyebrow = ({ children, color = '#0099ff', index }: { children: React.ReactNode; color?: string; index?: number }) => {
  // 编号小节:Forgeflow 招牌的 01/02 序号,序号色循环四色,正文沿用 muted
  const seqColors = ['#0099ff', '#01aef0', '#bafa77', '#d42672']
  const seq = typeof index === 'number' ? String(index).padStart(2, '0') : null
  return (
    <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
      {seq && (
        <span className="tabular font-semibold" style={{ color: seqColors[(index! - 1) % 4] }}>
          {seq}
        </span>
      )}
      <span className="h-px w-5 sm:w-6" style={{ background: `linear-gradient(to right, transparent, ${color}99)` }} />
      {children}
    </span>
  )
}

/* ─────────────────────────  共享报名按钮 / 价格条  ───────────────────────── */

// 白底渐变流光报名按钮：标题与点击回调由调用方传入，样式保持统一
export function EnrollButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-8 sm:py-3.5 sm:text-sm"
      style={{
        background: '#f0f0f0',
        boxShadow: '0 12px 40px -8px rgba(0,153,255,0.55)',
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(120deg, #57beff, #01aef0, #bafa77, #f8ec1d)',
          backgroundSize: '200% 200%',
          animation: 'shimmerText 4s linear infinite',
        }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {label}
        <ArrowRight />
      </span>
    </button>
  )
}

// 折扣价格条：originalPrice 缺省时隐藏原价划线与箭头，可复用于不同价位
export function PriceChip({
  badge,
  originalPrice,
  specialLabel,
  price,
  onClick,
}: {
  badge: string
  originalPrice?: string
  specialLabel: string
  price: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex cursor-pointer items-center gap-3 rounded-full border px-4 py-2 transition-transform hover:-translate-y-0.5 sm:gap-4 sm:px-5 sm:py-2.5"
      style={{
        borderColor: 'rgba(212,38,114,0.5)',
        background:
          'linear-gradient(110deg, rgba(212,38,114,0.18), rgba(248,236,29,0.14))',
        boxShadow:
          'inset 0 0 0 1px rgba(212,38,114,0.10), 0 0 28px -6px rgba(212,38,114,0.55)',
      }}
    >
      <span
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
        style={{
          background: 'linear-gradient(135deg, #ff52b7, #d1157a)',
          color: '#f0f0f0',
          boxShadow: '0 4px 14px -2px rgba(212,38,114,0.65)',
        }}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        {badge}
      </span>
      {originalPrice && (
        <>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="font-mono text-[11.5px] text-muted line-through tabular sm:text-[12.5px]">
              {originalPrice}
            </span>
          </div>
          <span aria-hidden className="text-muted">→</span>
        </>
      )}
      <div className="flex items-baseline gap-1 whitespace-nowrap">
        <span
          className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em]"
          style={{ color: '#ff52b7' }}
        >
          {specialLabel}
        </span>
        <span
          className="font-serif-zh text-[22px] font-bold tabular sm:text-[26px]"
          style={{
            color: '#ffd6ec',
            textShadow: '0 0 18px rgba(212,38,114,0.6)',
          }}
        >
          {price}
        </span>
      </div>
      <span
        className="inline-flex items-center gap-1 whitespace-nowrap pl-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: '#ff52b7' }}
      >
        立即报名
        <ArrowRight />
      </span>
    </button>
  )
}

/* ─────────────────────────  Hero 视觉元素  ───────────────────────── */

export const HeroAuroraLayers = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* 底色：清晰对比的多焦点 radial（缩小亮区面积、增强深色边界） */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 42% 40% at 14% 22%, rgba(0,153,255,0.52), transparent 55%), radial-gradient(ellipse 40% 40% at 86% 20%, rgba(1,174,240,0.45), transparent 55%), radial-gradient(ellipse 55% 35% at 50% 100%, rgba(212,38,114,0.30), transparent 60%)',
      }}
    />
    {/* 中心通透层：让标题/CTA 所在的中央区域明显更暗、对比更强 */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(5,5,7,0.78) 0%, rgba(5,5,7,0.35) 45%, transparent 75%)',
      }}
    />
    {/* 细网格点阵（贴近底部）—— 略提对比让"透彻感"更明显 */}
    <svg
      className="absolute inset-x-0 bottom-0 h-2/3 w-full opacity-[0.28]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hero-dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.55)" />
        </pattern>
        <linearGradient id="hero-dot-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="1" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="hero-dot-mask">
          <rect width="100%" height="100%" fill="url(#hero-dot-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-dot-grid)" mask="url(#hero-dot-mask)" />
    </svg>
  </div>
)

export type Orb = { left: string; top: string; size: number; color: string; dx: number; dy: number; dur: number; delay: number }

export const HERO_ORBS: Orb[] = [
  { left: '6%', top: '20%', size: 110, color: 'rgba(0,153,255,0.65)', dx: 26, dy: 18, dur: 12, delay: 0 },
  { left: '82%', top: '18%', size: 92, color: 'rgba(1,174,240,0.62)', dx: -24, dy: 16, dur: 14, delay: 0.6 },
  { left: '14%', top: '72%', size: 70, color: 'rgba(212,38,114,0.62)', dx: 22, dy: -12, dur: 10, delay: 1.2 },
  { left: '88%', top: '64%', size: 82, color: 'rgba(248,236,29,0.5)', dx: -20, dy: -20, dur: 15, delay: 0.3 },
  { left: '50%', top: '90%', size: 56, color: 'rgba(140,94,255,0.58)', dx: 16, dy: -14, dur: 11, delay: 1.8 },
  { left: '4%', top: '50%', size: 42, color: 'rgba(186,250,119,0.5)', dx: 12, dy: 14, dur: 10, delay: 1.0 },
]

export const FloatingOrbs = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    {HERO_ORBS.map((orb, i) => (
      <motion.span
        key={i}
        className="absolute rounded-full"
        style={{
          left: orb.left,
          top: orb.top,
          width: orb.size,
          height: orb.size,
          // 渐变本身就是柔和的；去掉 blur，让光点边缘清晰干净
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 58%)`,
        }}
        animate={{
          x: [0, orb.dx, 0, -orb.dx * 0.6, 0],
          y: [0, orb.dy, orb.dy * 1.5, orb.dy * 0.4, 0],
          opacity: [0.9, 1, 0.95, 1, 0.9],
        }}
        transition={{ duration: orb.dur, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
)

export const ShimmerHeading = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-block bg-clip-text text-transparent"
    style={{
      backgroundImage:
        'linear-gradient(110deg, #f0f0f0 0%, #57beff 20%, #01aef0 40%, #8c5eff 60%, #d42672 78%, #f0f0f0 100%)',
      backgroundSize: '300% 100%',
      animation: 'shimmerText 9s linear infinite',
    }}
  >
    {children}
  </span>
)
