'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { Reveal } from '../../motion'
import {
  PROJECT_TIMELINE,
  THEMES,
  STAGE2_THEMES,
  STAGE2_MILESTONES,
  AUDIENCES,
  STAGE1_PRICE,
  STAGE2_PRICE,
} from './data'
import type { Theme } from './data'

/* ─────────────────────────  全景学习路径 JourneyMap（一脉相承的成长曲线）  ─────────────────────────
 * 复刻原 CapabilityTimeline 的设计：一条平滑流动的成长曲线（Q/T 平滑贝塞尔）+ 辉光节点 + 流光动画。
 * 分两个阶段板块：第一阶段 9 个课时节点一条曲线，第二阶段 3 个里程碑一条曲线，各带价格小标。
 * 桌面端横向成长曲线（标签上下交替）；移动端降级为竖向时间线。无嵌套框、节点标签精炼。
 * ──────────────────────────────────────────────────────────────────────── */

type CurveNode = { key: string; theme: Theme; badge: string; title: string; detail: string }

/* 平滑成长曲线路径（Q + T 平滑贝塞尔，沿不规则起伏的节点自然流动）。 */
function buildSmoothPath(pts: ReadonlyArray<{ x: number; y: number }>): string {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const cur = pts[i]
    const next = pts[i + 1]
    const cx = (cur.x + next.x) / 2
    d += ` Q ${cx} ${cur.y}, ${cx} ${(cur.y + next.y) / 2} T ${next.x} ${next.y}`
  }
  return d
}

// 第一阶段 9 节点坐标（沿浅波浪起伏，viewBox 1200×260）——取自原成长曲线。
const STAGE1_XY: ReadonlyArray<{ x: number; y: number }> = [
  { x: 60, y: 170 }, { x: 200, y: 120 }, { x: 340, y: 150 }, { x: 480, y: 90 }, { x: 620, y: 145 },
  { x: 760, y: 100 }, { x: 900, y: 160 }, { x: 1040, y: 105 }, { x: 1140, y: 175 },
]
// 第二阶段 3 节点坐标（gentle wave，viewBox 1200×200）。
const STAGE2_XY: ReadonlyArray<{ x: number; y: number }> = [
  { x: 140, y: 130 }, { x: 600, y: 70 }, { x: 1060, y: 120 },
]

/* 一条成长曲线（桌面 SVG 流动曲线 + 辉光节点 + 流光；含上下交替标签）。 */
function GrowthCurve({
  nodes,
  coords,
  vbH,
  gradientStops,
  idPrefix,
}: {
  nodes: CurveNode[]
  coords: ReadonlyArray<{ x: number; y: number }>
  vbH: number
  gradientStops: { offset: number; color: string }[]
  idPrefix: string
}) {
  const pathD = useMemo(() => buildSmoothPath(coords), [coords])
  const containerH = vbH + 200 // 上方 100 + 下方 100 给标签留白
  const svgTop = 100
  const pathLen = 1300

  return (
    <>
      {/* 桌面端：横向成长曲线 */}
      <div className="relative hidden lg:block">
        <div className="relative w-full" style={{ height: containerH }}>
          <svg
            viewBox={`0 0 1200 ${vbH}`}
            preserveAspectRatio="none"
            className="absolute inset-x-0 w-full"
            style={{ top: svgTop, height: vbH }}
          >
            <defs>
              <linearGradient id={`${idPrefix}-line`} x1="0" y1="0" x2="1" y2="0">
                {gradientStops.map((s, i) => (
                  <stop key={i} offset={`${s.offset}`} stopColor={s.color} stopOpacity="0.9" />
                ))}
              </linearGradient>
              <filter id={`${idPrefix}-glow`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {nodes.map((node, i) => (
                <radialGradient key={node.key} id={`${idPrefix}-node-${i}`} cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor={node.theme.gradientFrom} stopOpacity="1" />
                  <stop offset="0.6" stopColor={node.theme.hex} stopOpacity="0.95" />
                  <stop offset="1" stopColor={node.theme.gradientTo} stopOpacity="0.2" />
                </radialGradient>
              ))}
            </defs>

            {/* 底层虚化曲线 */}
            <path d={pathD} stroke={`url(#${idPrefix}-line)`} strokeWidth="2.2" fill="none" opacity="0.45" />
            {/* 流光线（dash 动画顺曲线流动） */}
            <path
              d={pathD}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`40 ${pathLen}`}
              strokeLinecap="round"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="0" to={`-${pathLen + 40}`} dur="6s" repeatCount="indefinite" />
            </path>

            {/* 辉光节点（三层圆） */}
            {nodes.map((node, i) => {
              const { x, y } = coords[i]
              return (
                <g key={node.key} filter={`url(#${idPrefix}-glow)`}>
                  <circle cx={x} cy={y} r="18" fill={`url(#${idPrefix}-node-${i})`} opacity="0.55" />
                  <circle cx={x} cy={y} r="9" fill={node.theme.hex} />
                  <circle cx={x} cy={y} r="4" fill="#F5F5F7" />
                </g>
              )
            })}
          </svg>

          {/* 标签：上下交替 */}
          {nodes.map((node, i) => {
            const { x, y } = coords[i]
            const above = i % 2 === 0
            const leftPct = (x / 1200) * 100
            const topPx = above ? svgTop + y - 96 : svgTop + y + 26
            return (
              <motion.div
                key={node.key}
                initial={{ opacity: 0, y: above ? 12 : -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-[136px] -translate-x-1/2 text-center"
                style={{ left: `${leftPct}%`, top: topPx }}
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: node.theme.hex }}>
                  {node.badge}
                </span>
                <h4 className="font-serif-zh mt-1 text-[14px] font-semibold leading-[1.3] text-ink">{node.title}</h4>
                <p className="mt-1 text-[11px] leading-[1.55] text-muted">{node.detail}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 移动端：竖向时间线 */}
      <div className="relative lg:hidden">
        <span
          aria-hidden
          className="absolute left-[18px] top-2 bottom-2 w-px"
          style={{ background: `linear-gradient(to bottom, ${nodes.map((n) => n.theme.hex).join(', ')})`, opacity: 0.55 }}
        />
        <ol className="flex flex-col gap-5">
          {nodes.map((node, i) => (
            <Reveal key={node.key} delay={i * 0.04}>
              <li className="relative pl-12">
                <span
                  aria-hidden
                  className="absolute left-[10px] top-1.5 h-[18px] w-[18px] rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${node.theme.gradientFrom} 0%, ${node.theme.gradientTo} 80%)`,
                    boxShadow: `0 0 18px ${node.theme.hex}66`,
                  }}
                />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: node.theme.hex }}>
                  {node.badge}
                </span>
                <h4 className="font-serif-zh mt-1 text-[15px] font-semibold leading-[1.35] text-ink">{node.title}</h4>
                <p className="mt-1 text-[12px] leading-[1.7] text-ink-soft">{node.detail}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </>
  )
}

/* 阶段板块小标：名称 + 价格 + 覆盖 + 适合（纯文字 + 颜色点）。 */
function StageHead({
  accent,
  name,
  price,
  originalPrice,
  includes,
  coverage,
  fit,
  full = false,
}: {
  accent: string
  name: string
  price: string
  originalPrice?: string
  includes?: string
  coverage: string
  fit: string
  full?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1.5 inline-flex h-2.5 w-2.5 flex-none rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} />
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <span className="font-serif-zh text-[16px] font-bold text-ink sm:text-[18px]">{name}</span>
          {originalPrice && <span className="font-mono text-[11px] text-muted line-through tabular">原价 {originalPrice}</span>}
          <span className="font-serif-zh text-[19px] font-bold tabular sm:text-[21px]" style={{ color: full ? '#FECDD3' : accent, textShadow: `0 0 14px ${accent}55` }}>
            {price}
          </span>
          {includes && <span className="font-mono text-[10px] font-semibold tracking-[0.04em]" style={{ color: accent }}>· {includes}</span>}
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{coverage}</span>
        </div>
        <span className="text-[11.5px] leading-[1.5] text-muted">适合：{fit}</span>
      </div>
    </div>
  )
}

const STAGE1_NODES: CurveNode[] = PROJECT_TIMELINE.map((n) => ({
  key: `s1-${n.chapter}`, theme: THEMES[n.theme], badge: n.chapter, title: n.milestone, detail: n.detail,
}))
const STAGE2_NODES: CurveNode[] = STAGE2_MILESTONES.map((m) => ({
  key: `s2-${m.label}`, theme: STAGE2_THEMES[m.theme], badge: m.range, title: m.label, detail: m.gain,
}))

const STAGE1_STOPS = [
  { offset: 0, color: THEMES.cognition.hex }, { offset: 0.3, color: THEMES.frontend.hex },
  { offset: 0.55, color: THEMES.backend.hex }, { offset: 0.72, color: THEMES.agent.hex },
  { offset: 0.85, color: THEMES.launch.hex }, { offset: 1, color: THEMES.mindset.hex },
]
const STAGE2_STOPS = [
  { offset: 0, color: STAGE2_THEMES.advance.hex }, { offset: 0.5, color: STAGE2_THEMES.enterprise.hex },
  { offset: 1, color: STAGE2_THEMES.career.hex },
]

export function JourneyMap() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* ── 第一阶段板块 ── */}
      <Reveal>
        <StageHead
          accent={THEMES.cognition.hex}
          name={AUDIENCES.stage1.name}
          price={STAGE1_PRICE.now}
          originalPrice={STAGE1_PRICE.original}
          coverage={AUDIENCES.stage1.coverage}
          fit={AUDIENCES.stage1.fit}
        />
      </Reveal>
      <div className="mt-4 sm:mt-6">
        <GrowthCurve nodes={STAGE1_NODES} coords={STAGE1_XY} vbH={260} gradientStops={STAGE1_STOPS} idPrefix="s1" />
      </div>

      {/* ── LEVEL UP 分隔 ── */}
      <Reveal>
        <div className="my-6 flex items-center gap-3 sm:my-8">
          <span aria-hidden className="inline-flex h-2 w-2 animate-pulse rounded-full" style={{ background: STAGE2_THEMES.advance.hex, boxShadow: `0 0 10px ${STAGE2_THEMES.advance.hex}` }} />
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em]" style={{ color: STAGE2_THEMES.advance.hex }}>
            LEVEL UP · 进阶解锁
          </span>
          <span aria-hidden className="h-px flex-1" style={{ background: `linear-gradient(to right, ${STAGE2_THEMES.advance.hex}66, transparent)` }} />
        </div>
      </Reveal>

      {/* ── 第二阶段板块 ── */}
      <Reveal>
        <StageHead
          accent={STAGE2_THEMES.advance.hex}
          name={AUDIENCES.stage2.name}
          price={STAGE2_PRICE.now}
          includes={STAGE2_PRICE.includes}
          coverage={AUDIENCES.stage2.coverage}
          fit={AUDIENCES.stage2.fit}
          full
        />
      </Reveal>
      <div className="mt-4 sm:mt-6">
        <GrowthCurve nodes={STAGE2_NODES} coords={STAGE2_XY} vbH={200} gradientStops={STAGE2_STOPS} idPrefix="s2" />
      </div>
    </div>
  )
}
