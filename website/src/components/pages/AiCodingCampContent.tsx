'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { ContactQrCodeModal } from '../layout'
import { GradientText, Reveal } from '../motion'
import {
  THEMES, STAGE1_CHAPTERS as CHAPTERS, STAGE1_DELIVERABLES as DELIVERABLES,
  INSTRUCTOR_CREDENTIALS, STAGE1_SERVICE_STAGES as SERVICE_STAGES,
  PROJECT_TIMELINE, OVERVIEW_CARDS, TIMELINE_NODES_XY, buildSmoothPath,
} from './ai-coding-camp/data'

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
  </svg>
)

const SectionEyebrow = ({ children, color = '#A78BFA' }: { children: React.ReactNode; color?: string }) => (
  <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
    <span
      className="h-px w-5 sm:w-6"
      style={{ background: `linear-gradient(to right, transparent, ${color}99)` }}
    />
    {children}
  </span>
)

/* ─────────────────────────  Hero 视觉元素  ───────────────────────── */

const HeroAuroraLayers = () => (
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

type Orb = { left: string; top: string; size: number; color: string; dx: number; dy: number; dur: number; delay: number }

const HERO_ORBS: Orb[] = [
  { left: '6%', top: '20%', size: 110, color: 'rgba(167,139,250,0.65)', dx: 26, dy: 18, dur: 12, delay: 0 },
  { left: '82%', top: '18%', size: 92, color: 'rgba(34,211,238,0.62)', dx: -24, dy: 16, dur: 14, delay: 0.6 },
  { left: '14%', top: '72%', size: 70, color: 'rgba(232,121,249,0.62)', dx: 22, dy: -12, dur: 10, delay: 1.2 },
  { left: '88%', top: '64%', size: 82, color: 'rgba(251,191,36,0.5)', dx: -20, dy: -20, dur: 15, delay: 0.3 },
  { left: '50%', top: '90%', size: 56, color: 'rgba(56,189,248,0.58)', dx: 16, dy: -14, dur: 11, delay: 1.8 },
  { left: '4%', top: '50%', size: 42, color: 'rgba(52,211,153,0.5)', dx: 12, dy: 14, dur: 10, delay: 1.0 },
]

const FloatingOrbs = () => (
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

const ShimmerHeading = ({ children }: { children: React.ReactNode }) => (
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

/* ─────────────────────────  能力主线 SVG  ───────────────────────── */

const CapabilityTimeline = () => {
  const pathD = useMemo(() => buildSmoothPath(), [])

  return (
    <>
      {/* 桌面端：横向 SVG 时间线 */}
      <div className="relative hidden lg:block">
        <div className="relative h-[360px] w-full">
          <svg
            viewBox="0 0 1200 260"
            className="absolute inset-x-0 top-6 h-[260px] w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="timeline-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={THEMES.cognition.hex} stopOpacity="0.9" />
                <stop offset="0.3" stopColor={THEMES.frontend.hex} stopOpacity="0.9" />
                <stop offset="0.55" stopColor={THEMES.backend.hex} stopOpacity="0.9" />
                <stop offset="0.72" stopColor={THEMES.agent.hex} stopOpacity="0.9" />
                <stop offset="0.85" stopColor={THEMES.launch.hex} stopOpacity="0.9" />
                <stop offset="1" stopColor={THEMES.mindset.hex} stopOpacity="0.9" />
              </linearGradient>
              <filter id="timeline-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {PROJECT_TIMELINE.map((node) => {
                const t = THEMES[node.theme]
                return (
                  <radialGradient key={node.theme + '_' + node.chapter} id={`node-${node.chapter}`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor={t.gradientFrom} stopOpacity="1" />
                    <stop offset="0.6" stopColor={t.hex} stopOpacity="0.95" />
                    <stop offset="1" stopColor={t.gradientTo} stopOpacity="0.2" />
                  </radialGradient>
                )
              })}
            </defs>

            {/* 底层虚化线 */}
            <path d={pathD} stroke="url(#timeline-line)" strokeWidth="2.2" fill="none" opacity="0.45" />
            {/* 流光线（dash 动画） */}
            <path
              d={pathD}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray="40 1400"
              strokeLinecap="round"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-1440" dur="6s" repeatCount="indefinite" />
            </path>

            {/* 节点 */}
            {PROJECT_TIMELINE.map((node, i) => {
              const { x, y } = TIMELINE_NODES_XY[i]
              return (
                <g key={node.chapter} filter="url(#timeline-glow)">
                  <circle cx={x} cy={y} r="18" fill={`url(#node-${node.chapter})`} opacity="0.55" />
                  <circle cx={x} cy={y} r="9" fill={THEMES[node.theme].hex} />
                  <circle cx={x} cy={y} r="4" fill="#F5F5F7" />
                </g>
              )
            })}
          </svg>

          {/* 标签：上下交替 */}
          {PROJECT_TIMELINE.map((node, i) => {
            const { x, y } = TIMELINE_NODES_XY[i]
            const above = i % 2 === 0
            const leftPct = (x / 1200) * 100
            const topPx = above ? 24 + (y / 260) * 260 - 130 : 24 + (y / 260) * 260 + 30
            const t = THEMES[node.theme]
            return (
              <motion.div
                key={node.chapter}
                initial={{ opacity: 0, y: above ? 12 : -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-[130px] -translate-x-1/2 text-center"
                style={{ left: `${leftPct}%`, top: topPx }}
              >
                <span
                  className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
                  style={{ color: t.hex }}
                >
                  {node.chapter}
                </span>
                <h4 className="font-serif-zh mt-1 text-[14px] font-semibold leading-[1.3] text-ink">
                  {node.milestone}
                </h4>
                <p className="mt-1 text-[11px] leading-[1.55] text-muted">{node.detail}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 移动端：竖向时间线 */}
      <div className="relative lg:hidden">
        <div
          aria-hidden
          className="absolute left-[18px] top-2 bottom-2 w-px"
          style={{
            background:
              `linear-gradient(to bottom, ${THEMES.cognition.hex}, ${THEMES.frontend.hex}, ${THEMES.backend.hex}, ${THEMES.agent.hex}, ${THEMES.launch.hex}, ${THEMES.mobile.hex}, ${THEMES.mindset.hex})`,
            opacity: 0.55,
          }}
        />
        <ol className="flex flex-col gap-5">
          {PROJECT_TIMELINE.map((node, i) => {
            const t = THEMES[node.theme]
            return (
              <Reveal key={node.chapter} delay={i * 0.04}>
                <li className="relative pl-12">
                  <span
                    aria-hidden
                    className="absolute left-[10px] top-1.5 h-[18px] w-[18px] rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  />
                  <span
                    className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
                    style={{ color: t.hex }}
                  >
                    {node.chapter}
                  </span>
                  <h4 className="font-serif-zh mt-1 text-[15px] font-semibold leading-[1.35] text-ink">
                    {node.milestone}
                  </h4>
                  <p className="mt-1 text-[12px] leading-[1.7] text-ink-soft">{node.detail}</p>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </>
  )
}

/* ─────────────────────────  主组件  ───────────────────────── */

export function AiCodingCampContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <HeroAuroraLayers />
        <FloatingOrbs />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:pt-32">
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-7 max-w-4xl text-balance text-[30px] font-bold leading-[1.32] tracking-[-0.005em] sm:mt-8 sm:text-[46px] sm:leading-[1.22] lg:text-[58px] lg:leading-[1.15]">
              <ShimmerHeading>零基础 AI 编程实战训练营</ShimmerHeading>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-6 max-w-3xl sm:mt-7">
              <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
                <span className="block">
                  从想法到上线 ·{' '}
                  <GradientText className="font-semibold">一条主线贯穿全程</GradientText>
                </span>
                <span className="mt-2 block text-[14px] sm:mt-3 sm:text-[16px] lg:text-[17px]">
                  <span
                    className="font-semibold"
                    style={{ color: '#67E8F9', textShadow: '0 0 14px rgba(103,232,249,0.45)' }}
                  >
                    不用担心学不会
                  </span>
                  <span className="text-ink-soft"> · AI 让你不需要看一行代码 </span>
                  <span className="font-semibold text-ink">即可做出专属应用</span>
                </span>
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-col items-center gap-4 sm:mt-11">
              {/* 价格条 */}
              <div
                className="inline-flex items-center gap-3 rounded-full border px-4 py-2 sm:gap-4 sm:px-5 sm:py-2.5"
                style={{
                  borderColor: 'rgba(251,113,133,0.5)',
                  background:
                    'linear-gradient(110deg, rgba(251,113,133,0.18), rgba(251,191,36,0.14))',
                  boxShadow:
                    'inset 0 0 0 1px rgba(251,113,133,0.10), 0 0 28px -6px rgba(251,113,133,0.55)',
                }}
              >
                <span
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                  style={{
                    background: 'linear-gradient(135deg, #FB7185, #E11D48)',
                    color: '#F5F5F7',
                    boxShadow: '0 4px 14px -2px rgba(251,113,133,0.65)',
                  }}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  首批限定
                </span>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="font-mono text-[11.5px] text-muted line-through tabular sm:text-[12.5px]">
                    原价 ¥2999
                  </span>
                </div>
                <span aria-hidden className="text-muted">→</span>
                <div className="flex items-baseline gap-1 whitespace-nowrap">
                  <span
                    className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em]"
                    style={{ color: '#FDA4AF' }}
                  >
                    限时特价
                  </span>
                  <span
                    className="font-serif-zh text-[22px] font-bold tabular sm:text-[26px]"
                    style={{
                      color: '#FECDD3',
                      textShadow: '0 0 18px rgba(251,113,133,0.6)',
                    }}
                  >
                    ¥1999
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 服务承诺横条 */}
          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:mt-14">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft sm:text-[12px]">
                · 服务承诺 · COMMITMENT ·
              </span>
              <div
                className="flex w-full max-w-[1200px] flex-col items-stretch gap-2.5 rounded-[24px] border-2 p-3.5 backdrop-blur-md sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2.5"
                style={{
                  borderColor: 'rgba(167,139,250,0.42)',
                  background:
                    'linear-gradient(110deg, rgba(167,139,250,0.16), rgba(110,231,183,0.12) 33%, rgba(251,191,36,0.14) 66%, rgba(251,113,133,0.14))',
                  boxShadow:
                    '0 16px 48px -12px rgba(167,139,250,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
                }}
              >
                {/* CTO 亲自教学 */}
                <div className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]">
                  <span
                    className="rounded-md border px-2 py-1 font-mono text-[11.5px] font-bold tracking-[0.1em] sm:text-[12.5px]"
                    style={{
                      color: '#F5F5F7',
                      borderColor: 'rgba(196,181,253,0.7)',
                      background: 'linear-gradient(135deg, rgba(196,181,253,0.35), rgba(167,139,250,0.20))',
                      boxShadow: '0 0 14px -2px rgba(167,139,250,0.55)',
                    }}
                  >
                    CTO
                  </span>
                  <span className="font-semibold text-ink">亲自教学</span>
                </div>
                <span aria-hidden className="hidden h-7 w-px bg-hairline-strong sm:block" />
                {/* 交付成果：4 件你自己亲手做出来的交付成果 */}
                <div className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]">
                  <span
                    className="font-mono text-[17px] font-bold tabular sm:text-[18px]"
                    style={{
                      color: '#FDA4AF',
                      textShadow: '0 0 18px rgba(251,113,133,0.55)',
                    }}
                  >
                    4 件
                  </span>
                  <span className="font-medium text-ink">你自己亲手做出来的交付成果</span>
                </div>
                <span aria-hidden className="hidden h-7 w-px bg-hairline-strong sm:block" />
                {/* 最长 6 个月陪跑答疑（强调） */}
                <div
                  className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(251,191,36,0.32), rgba(251,191,36,0.14))',
                    boxShadow:
                      'inset 0 0 0 1.5px rgba(251,191,36,0.55), 0 0 24px -6px rgba(251,191,36,0.55)',
                  }}
                >
                  <span
                    className="font-mono text-[17px] font-bold tabular sm:text-[18px]"
                    style={{
                      color: '#FDE68A',
                      textShadow: '0 0 18px rgba(251,191,36,0.7)',
                    }}
                  >
                    最长 6 个月
                  </span>
                  <span className="font-bold" style={{ color: '#FDE68A' }}>
                    陪跑答疑
                  </span>
                  <span
                    className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full"
                    style={{
                      background: '#FCD34D',
                      boxShadow: '0 0 8px rgba(252,211,77,0.9)',
                    }}
                  />
                </div>
                <span aria-hidden className="hidden h-7 w-px bg-hairline-strong sm:block" />
                {/* 长期 AI 编程社区 */}
                <div className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]">
                  <span
                    className="font-mono text-[17px] font-bold tabular sm:text-[18px]"
                    style={{
                      color: '#6EE7B7',
                      textShadow: '0 0 16px rgba(110,231,183,0.5)',
                    }}
                  >
                    长期
                  </span>
                  <span className="font-medium text-ink">零基础 AI 编程分享社区</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. 四大成果：你将拿到什么 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#FDA4AF">你将拿到</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">学完，你手里会有</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">4 件你自己亲手做出来的交付成果</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              不是看老师演示的截图，不是跑一遍 demo——是亲手做出来、能扫码访问、能发给朋友看的产品。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
          {DELIVERABLES.map((item, i) => {
            const t = THEMES[item.theme]
            return (
              <Reveal key={item.code} delay={i * 0.06}>
                <article
                  className="group relative h-full overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[26px] sm:p-7"
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.28)`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, 0.12) 0%, rgba(13,13,18,0.6) 60%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  {/* 主题色光晕 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
                      filter: 'blur(24px)',
                    }}
                  />
                  {/* 巨大半透明序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-2 right-2 select-none font-mono text-[120px] font-black leading-none tabular sm:right-3 sm:text-[160px]"
                    style={{ color: t.hex, opacity: 0.06 }}
                  >
                    {item.code}
                  </span>

                  <div className="relative flex h-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-canvas sm:h-10 sm:w-10 sm:text-[13px]"
                        style={{
                          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                          boxShadow: `0 4px 16px -2px ${t.hex}66`,
                        }}
                      >
                        {item.code}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px]"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.35)`,
                          color: t.hex,
                          background: `rgba(${t.rgb}, 0.08)`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.hex }} />
                        交付物 · DELIVERABLE
                      </span>
                    </div>

                    <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.35] text-ink sm:text-[22px]">
                      {item.title}
                    </h3>
                    <p
                      className="text-[12.5px] font-medium leading-[1.6] sm:text-[13px]"
                      style={{ color: t.hex }}
                    >
                      {item.subtitle}
                    </p>
                    <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                      {item.body}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {item.badges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px]"
                          style={{
                            borderColor: `rgba(${t.rgb}, 0.25)`,
                            background: `rgba(${t.rgb}, 0.05)`,
                            color: `rgba(${t.rgb}, 1)`,
                          }}
                        >
                          ✓ {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 3. 讲师介绍：行明 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#C4B5FD">讲师介绍</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">亲自带你的人 ·</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">12 年实战 + 4 年 CTO + 2 年 AI 大模型应用教学</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              不是只会讲 PPT 的"AI 老师"——是真正在一线写过、做过、带过团队、踩过坑的工程师。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-[1fr_1.55fr]">
          {/* 讲师名片 */}
          <Reveal>
            <div
              className="relative h-full overflow-hidden rounded-[24px] border p-6 backdrop-blur-xl sm:rounded-[28px] sm:p-8"
              style={{
                borderColor: 'rgba(196,181,253,0.32)',
                background:
                  'linear-gradient(140deg, rgba(167,139,250,0.16) 0%, rgba(232,121,249,0.10) 50%, rgba(13,13,18,0.55) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(196,181,253,0.06), 0 16px 48px -16px rgba(167,139,250,0.4)',
              }}
            >
              {/* 主题色光晕 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-70"
                style={{
                  background: 'radial-gradient(circle, rgba(196,181,253,0.5) 0%, transparent 65%)',
                }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full opacity-60"
                style={{
                  background: 'radial-gradient(circle, rgba(232,121,249,0.4) 0%, transparent 65%)',
                }}
              />

              <div className="relative flex h-full flex-col gap-5">
                {/* 头像占位 */}
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl font-serif-zh text-[26px] font-bold text-canvas sm:h-20 sm:w-20 sm:text-[32px]"
                    style={{
                      background: 'linear-gradient(135deg, #C4B5FD, #A78BFA 50%, #7C3AED)',
                      boxShadow: '0 12px 28px -8px rgba(167,139,250,0.65), inset 0 0 0 1px rgba(255,255,255,0.2)',
                    }}
                  >
                    行
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                      style={{ color: '#C4B5FD' }}
                    >
                      主讲老师 · INSTRUCTOR
                    </span>
                    <h3 className="font-serif-zh text-[24px] font-bold leading-none text-ink sm:text-[28px]">
                      行明
                      <span className="ml-2 align-middle font-mono text-[12px] font-medium text-ink-soft sm:text-[13px]">
                        XING MING
                      </span>
                    </h3>
                  </div>
                </div>

                {/* 头衔徽标组 */}
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                    style={{
                      borderColor: 'rgba(196,181,253,0.45)',
                      background: 'rgba(167,139,250,0.10)',
                      color: '#C4B5FD',
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#C4B5FD' }} />
                    创业公司 CTO
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                    style={{
                      borderColor: 'rgba(103,232,249,0.45)',
                      background: 'rgba(34,211,238,0.10)',
                      color: '#67E8F9',
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#67E8F9' }} />
                    一线工程师
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                    style={{
                      borderColor: 'rgba(253,164,175,0.45)',
                      background: 'rgba(251,113,133,0.10)',
                      color: '#FDA4AF',
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#FDA4AF' }} />
                    AI 教学者
                  </span>
                </div>

                {/* 短引言 */}
                <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                  「我自己用 AI 编程做完整产品已经做了两年，也用同一套工作流带过零基础学员从 0 跑到上线——这门课讲的就是我自己每天在用的那一套。」
                </p>

                <div
                  className="mt-auto flex items-center gap-2 rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3"
                  style={{
                    borderColor: 'rgba(196,181,253,0.22)',
                    background: 'rgba(167,139,250,0.06)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ background: '#C4B5FD', boxShadow: '0 0 6px rgba(196,181,253,0.8)' }}
                  />
                  <span className="text-[12.5px] font-medium text-ink sm:text-[13px]">
                    每期训练营由行明亲自授课、亲自答疑，不外包、不录播充数
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 4 项资历卡片 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {INSTRUCTOR_CREDENTIALS.map((cred, i) => {
              const t = THEMES[cred.theme]
              return (
                <Reveal key={cred.label} delay={i * 0.06}>
                  <div
                    className="group relative h-full overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[22px] sm:p-6"
                    style={{
                      borderColor: `rgba(${t.rgb}, 0.26)`,
                      background: `linear-gradient(135deg, rgba(${t.rgb}, 0.12) 0%, rgba(13,13,18,0.55) 65%)`,
                      boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                    }}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-80"
                      style={{
                        background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
                      }}
                    />
                    <div className="relative flex h-full flex-col gap-3">
                      <span
                        className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: t.hex }}
                      >
                        CREDENTIAL · {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-serif-zh text-[28px] font-bold leading-none tabular sm:text-[34px]"
                          style={{
                            color: t.hex,
                            textShadow: `0 0 18px ${t.hex}66`,
                          }}
                        >
                          {cred.metric}
                        </span>
                      </div>
                      <h4 className="text-[14px] font-semibold leading-[1.4] text-ink sm:text-[15px]">
                        {cred.label}
                      </h4>
                      <p className="text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13px]">
                        {cred.detail}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. 课程总览：三张卡片（带主题色光晕） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow>课程总览</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">不是教你「用 AI 写两段代码」，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">而是带你做一个真正能用的产品</GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {OVERVIEW_CARDS.map((card, i) => {
            const t = THEMES[card.theme]
            return (
              <Reveal key={card.eyebrow} delay={i * 0.08}>
                <div
                  className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[22px] sm:p-7"
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.22)`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, 0.10) 0%, rgba(13,13,18,0.55) 65%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-90"
                    style={{ background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`, filter: 'blur(20px)' }}
                  />
                  <span
                    className="font-mono text-[12px] font-semibold tracking-[0.18em]"
                    style={{ color: t.hex }}
                  >
                    {card.eyebrow}
                  </span>
                  <h3 className="font-serif-zh text-[17px] font-semibold leading-[1.4] text-ink sm:text-[19px]">
                    {card.title}
                  </h3>
                  <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">{card.body}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 5. 能力主线 SVG 时间线 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-32">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#67E8F9">能力主线</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">从认识工具到独立上线，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">一脉相承的成长曲线</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              九个关键节点串成一条彩色主线——每章的交付物建立在前一章能力之上，最终把你带到能独立上线产品的位置。
            </p>
          </div>
        </Reveal>

        <div className="relative mt-10 overflow-hidden rounded-[24px] border border-hairline bg-canvas/30 p-5 backdrop-blur-xl sm:mt-14 sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(circle at 12% 20%, rgba(167,139,250,0.18), transparent 50%), radial-gradient(circle at 88% 80%, rgba(34,211,238,0.16), transparent 50%)',
            }}
          />
          <div className="relative">
            <CapabilityTimeline />
          </div>
        </div>
      </section>

      {/* 6. 十章大纲：差异化主题色 + 超大背景序号 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#F0ABFC">十章大纲</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">每一章都有看得见、</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">摸得着的产出物</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              每章都有看得见、摸得着的交付物——前一章的能力承接后一章。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-5 sm:mt-12 sm:gap-6">
          {CHAPTERS.map((chapter, i) => {
            const t = THEMES[chapter.theme]
            return (
              <Reveal key={chapter.index} delay={Math.min(i, 4) * 0.04}>
                <article
                  className="group relative overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl transition-all duration-500 sm:rounded-[28px] sm:p-7 lg:p-8"
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.22)`,
                    background: `linear-gradient(120deg, rgba(${t.rgb}, 0.08) 0%, rgba(13,13,18,0.55) 60%)`,
                    boxShadow: `inset 1px 0 0 0 rgba(${t.rgb}, 0.5), inset 0 0 0 1px rgba(${t.rgb}, 0.04)`,
                  }}
                >
                  {/* 左侧主题色光晕条 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 h-full w-1.5"
                    style={{ background: `linear-gradient(to bottom, ${t.gradientFrom}, ${t.gradientTo})` }}
                  />
                  {/* 右下角超大半透明章节号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-4 -right-2 select-none font-mono text-[120px] font-black leading-none tabular sm:-bottom-6 sm:-right-4 sm:text-[180px] lg:text-[220px]"
                    style={{
                      color: t.hex,
                      opacity: 0.06,
                      WebkitTextStroke: `1px ${t.hex}33`,
                    }}
                  >
                    {String(chapter.index).padStart(2, '0')}
                  </span>

                  <div className="relative flex flex-col gap-5">
                    {/* 顶部：章号 + 标题 + 主题标签 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <span
                          className="flex h-12 w-12 flex-none items-center justify-center rounded-xl font-mono text-[15px] font-bold text-canvas sm:h-14 sm:w-14 sm:text-[17px]"
                          style={{
                            background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                            boxShadow: `0 6px 18px -4px ${t.hex}66`,
                          }}
                        >
                          {String(chapter.index).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col gap-2">
                          <span
                            className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em]"
                            style={{ color: t.hex }}
                          >
                            第 {chapter.index} 章 · {t.label}
                          </span>
                          <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.4] text-ink sm:text-[22px] lg:text-[25px]">
                            {chapter.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* 交付物 + 引言 */}
                    <div
                      className="flex flex-col gap-3 rounded-xl border p-4 sm:p-5"
                      style={{
                        borderColor: `rgba(${t.rgb}, 0.18)`,
                        background: `linear-gradient(135deg, rgba(${t.rgb}, 0.06) 0%, rgba(5,5,7,0.5) 100%)`,
                      }}
                    >
                      <div className="flex flex-col gap-1.5">
                        <span
                          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: t.hex }}
                        >
                          交付物
                        </span>
                        <p className="text-[13.5px] font-medium leading-[1.7] text-ink sm:text-[14.5px]">
                          {chapter.deliverable}
                        </p>
                      </div>
                      <p className="text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                        {chapter.intro}
                      </p>
                    </div>

                    {/* 提示色块 */}
                    {chapter.warning && (
                      <div
                        className="flex flex-col gap-1.5 rounded-xl border p-4 sm:p-5"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.35)`,
                          background: `rgba(${t.rgb}, 0.08)`,
                        }}
                      >
                        <span
                          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                          style={{ color: t.hex }}
                        >
                          {chapter.warning.label}
                        </span>
                        <p className="text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13px]">
                          {chapter.warning.body}
                        </p>
                      </div>
                    )}

                    {/* 子章节列表 */}
                    <ul className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
                      {chapter.lessons.map((lesson) => (
                        <li
                          key={lesson.code}
                          className="flex items-start gap-3 rounded-xl border p-3.5 transition-colors hover:border-hairline-strong sm:gap-3.5 sm:p-4"
                          style={{
                            borderColor: 'rgba(255,255,255,0.07)',
                            background: 'rgba(5,5,7,0.45)',
                          }}
                        >
                          <span
                            className="flex h-7 min-w-[2.5rem] flex-none items-center justify-center rounded-md px-2 font-mono text-[11px] font-semibold tabular sm:h-8 sm:text-[11.5px]"
                            style={{
                              background: `linear-gradient(135deg, rgba(${t.rgb}, 0.18), rgba(${t.rgb}, 0.08))`,
                              border: `1px solid rgba(${t.rgb}, 0.22)`,
                              color: t.hex,
                            }}
                          >
                            {lesson.code}
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-semibold text-ink sm:text-[13.5px]">
                              {lesson.title}
                            </span>
                            <span className="text-[12px] leading-[1.75] text-muted sm:text-[12.5px]">
                              {lesson.brief}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 7. 服务模式：怎么交付 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#FCD34D">服务模式</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">1 个月线上直播 ·</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">最长 6 个月持续陪跑</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              用一个月把十章系统化课程结构化交付给你，再用最长 6 个月把能力真正稳住——边学边做，结业时 4 件你自己亲手做出来的交付成果同步产出；课程之外的真实问题，6 个月内都可以继续来问。
            </p>
          </div>
        </Reveal>

        {/* 2 大对等阶段：直播 + 6 月陪跑 */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2">
          {SERVICE_STAGES.map((stage, i) => {
            const t = THEMES[stage.theme]
            const isCompanion = stage.code === '02'
            return (
              <Reveal key={stage.code} delay={i * 0.1}>
                <article
                  className="group relative h-full overflow-hidden rounded-[24px] border p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[28px] sm:p-8 lg:p-9"
                  style={{
                    borderColor: `rgba(${t.rgb}, ${isCompanion ? 0.4 : 0.28})`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, ${isCompanion ? 0.14 : 0.10}) 0%, rgba(13,13,18,0.55) 60%)`,
                    boxShadow: isCompanion
                      ? `inset 0 0 0 1px rgba(${t.rgb}, 0.18), 0 20px 50px -20px ${t.hex}55`
                      : `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  {/* 主题色光晕 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}66 0%, transparent 65%)`,
                      filter: 'blur(28px)',
                    }}
                  />
                  {/* 巨号背景序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-2 select-none font-mono text-[180px] font-black leading-none tabular sm:text-[220px]"
                    style={{ color: t.hex, opacity: 0.05 }}
                  >
                    {stage.code}
                  </span>

                  <div className="relative flex h-full flex-col gap-4">
                    {/* 顶部标签 + 时长徽标 */}
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-[11px] font-semibold tracking-[0.18em]"
                        style={{ color: t.hex }}
                      >
                        STAGE · {stage.code} · {stage.stage}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold tabular text-canvas"
                        style={{
                          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                          boxShadow: `0 6px 18px -4px ${t.hex}66`,
                        }}
                      >
                        {stage.duration}
                      </span>
                    </div>

                    <h3 className="font-serif-zh text-[22px] font-semibold leading-[1.3] text-ink sm:text-[26px] lg:text-[28px]">
                      {stage.title}
                    </h3>
                    <p
                      className="text-[13.5px] font-medium leading-[1.6] sm:text-[14.5px]"
                      style={{ color: t.hex }}
                    >
                      {stage.highlight}
                    </p>
                    <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                      {stage.body}
                    </p>

                    {/* 详细服务清单 */}
                    <ul className="mt-2 flex flex-col gap-2.5 border-t pt-4 sm:gap-3 sm:pt-5"
                      style={{ borderColor: `rgba(${t.rgb}, 0.15)` }}
                    >
                      {stage.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-ink-soft sm:text-[13px]">
                          <span
                            aria-hidden
                            className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                              boxShadow: `0 0 8px ${t.hex}88`,
                            }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {isCompanion && (
                      <div
                        className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] sm:text-[11px]"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.45)`,
                          background: `rgba(${t.rgb}, 0.10)`,
                          color: t.hex,
                        }}
                      >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: t.hex }} />
                        训练营独家承诺
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* 时间轴条 */}
        <Reveal delay={0.18}>
          <div
            className="relative mt-6 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl sm:mt-8 sm:rounded-[22px] sm:p-6"
            style={{
              borderColor: 'rgba(167,139,250,0.22)',
              background:
                'linear-gradient(110deg, rgba(167,139,250,0.10) 0%, rgba(251,113,133,0.08) 50%, rgba(251,191,36,0.10) 100%)',
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                  TIMELINE · 服务节奏
                </span>
                <p className="text-[14px] font-semibold text-ink sm:text-[15px]">
                  1 个月集中授课 · 边学边交付 · 最长 6 个月持续答疑陪跑
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] tabular text-ink-soft sm:text-[12px]">
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(167,139,250,0.18)', color: '#C4B5FD' }}
                >
                  第 1 月 · 直播
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(251,113,133,0.15)', color: '#FDA4AF' }}
                >
                  实操产出
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#FCD34D' }}
                >
                  6 月陪跑
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8. 底部 CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 sm:pb-28 lg:pb-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] border p-7 text-center sm:rounded-[32px] sm:p-12 lg:p-16"
            style={{
              borderColor: 'rgba(167,139,250,0.32)',
              background: 'rgba(5,5,7,0.65)',
            }}
          >
            {/* 4 角彩色高亮（紫青琥珀玫红） */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 40% 55% at 0% 0%, rgba(167,139,250,0.36), transparent 60%), radial-gradient(ellipse 40% 55% at 100% 0%, rgba(34,211,238,0.28), transparent 60%), radial-gradient(ellipse 40% 55% at 100% 100%, rgba(251,191,36,0.26), transparent 60%), radial-gradient(ellipse 40% 55% at 0% 100%, rgba(232,121,249,0.24), transparent 60%)',
              }}
            />
            {/* 中心通透层：让标题/CTA 干净浮起 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(5,5,7,0.62) 0%, rgba(5,5,7,0.25) 50%, transparent 80%)',
              }}
            />
            {/* 清晰光点（无 blur） */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-[8%] top-[18%] h-16 w-16 rounded-full sm:h-20 sm:w-20"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.62) 0%, transparent 58%)' }}
              animate={{ y: [0, -16, 0], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute right-[10%] bottom-[16%] h-14 w-14 rounded-full sm:h-16 sm:w-16"
              style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.55) 0%, transparent 58%)' }}
              animate={{ y: [0, 14, 0], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute right-[16%] top-[24%] h-10 w-10 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.55) 0%, transparent 60%)' }}
              animate={{ y: [0, -12, 0], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-[14%] bottom-[22%] h-9 w-9 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(232,121,249,0.55) 0%, transparent 60%)' }}
              animate={{ y: [0, 12, 0], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="font-serif-zh max-w-2xl text-balance text-[24px] font-semibold leading-[1.35] sm:text-[30px] sm:leading-[1.3] lg:text-[38px]">
                想看看自己学完
                <GradientText className="font-semibold">能做出什么</GradientText>
                ？
              </h2>
              <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
                训练营按期开班、限量招生。先扫码联系，我们会按你的基础与目标给出具体的入营建议。
              </p>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={openContact}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-8 sm:py-3.5 sm:text-sm"
                  style={{
                    background: '#F5F5F7',
                    boxShadow: '0 12px 40px -8px rgba(167,139,250,0.55)',
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: 'linear-gradient(120deg, #C4B5FD, #67E8F9, #F0ABFC, #FCD34D)',
                      backgroundSize: '200% 200%',
                      animation: 'shimmerText 4s linear infinite',
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    立即咨询报名
                    <ArrowRight />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
