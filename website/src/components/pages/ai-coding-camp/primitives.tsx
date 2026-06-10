'use client'

import { motion } from 'framer-motion'

export const ArrowRight = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
  </svg>
)

export const SectionEyebrow = ({ children, color = '#A78BFA' }: { children: React.ReactNode; color?: string }) => (
  <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
    <span
      className="h-px w-5 sm:w-6"
      style={{ background: `linear-gradient(to right, transparent, ${color}99)` }}
    />
    {children}
  </span>
)

/* ─────────────────────────  Hero 视觉元素  ───────────────────────── */

export const HeroAuroraLayers = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* 底色：清晰对比的多焦点 radial（缩小亮区面积、增强深色边界） */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 42% 40% at 14% 22%, rgba(167,139,250,0.52), transparent 55%), radial-gradient(ellipse 40% 40% at 86% 20%, rgba(34,211,238,0.45), transparent 55%), radial-gradient(ellipse 55% 35% at 50% 100%, rgba(232,121,249,0.30), transparent 60%)',
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
  { left: '6%', top: '20%', size: 110, color: 'rgba(167,139,250,0.65)', dx: 26, dy: 18, dur: 12, delay: 0 },
  { left: '82%', top: '18%', size: 92, color: 'rgba(34,211,238,0.62)', dx: -24, dy: 16, dur: 14, delay: 0.6 },
  { left: '14%', top: '72%', size: 70, color: 'rgba(232,121,249,0.62)', dx: 22, dy: -12, dur: 10, delay: 1.2 },
  { left: '88%', top: '64%', size: 82, color: 'rgba(251,191,36,0.5)', dx: -20, dy: -20, dur: 15, delay: 0.3 },
  { left: '50%', top: '90%', size: 56, color: 'rgba(56,189,248,0.58)', dx: 16, dy: -14, dur: 11, delay: 1.8 },
  { left: '4%', top: '50%', size: 42, color: 'rgba(52,211,153,0.5)', dx: 12, dy: 14, dur: 10, delay: 1.0 },
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
        'linear-gradient(110deg, #F5F5F7 0%, #C4B5FD 20%, #67E8F9 40%, #F0ABFC 60%, #FDA4AF 78%, #F5F5F7 100%)',
      backgroundSize: '300% 100%',
      animation: 'shimmerText 9s linear infinite',
    }}
  >
    {children}
  </span>
)
