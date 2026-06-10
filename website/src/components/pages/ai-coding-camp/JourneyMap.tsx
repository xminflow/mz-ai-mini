'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { Reveal } from '../../motion'
import {
  STAGE1_CHAPTERS,
  THEMES,
  STAGE2_THEMES,
  AUDIENCES,
  STAGE1_PRICE,
  STAGE2_PRICE,
} from './data'
import type { Theme, Stage2ThemeKey } from './data'

/* ─────────────────────────  全景学习路径 JourneyMap（蛇形蜿蜒成长曲线）  ─────────────────────────
 * 复刻原 CapabilityTimeline 的平滑流动曲线 + 辉光节点 + 流光动画，并把走线改成「蛇形(boustrophedon)」：
 * 上行 → 右侧圆角下折 → 下行 → … 这样一条曲线能容纳更多节点。
 *  - 第一阶段：outline.md 全部 10 个课时全称，单行平滑成长曲线（带一句交付物）。
 *  - 第二阶段：同款单行成长曲线，把分集课时（上/下、一/二）合并压缩到 11 个节点。
 * 桌面端蛇形曲线（标签上下交替）；移动端降级为竖向时间线。无嵌套框。
 * ──────────────────────────────────────────────────────────────────────── */

type Pt = { x: number; y: number }
type CurveNode = { key: string; theme: Theme; badge: string; title: string; detail: string }

/* Catmull-Rom → 三次贝塞尔：平滑穿过任意点序列（含蛇形转弯航点），整条线自然流动。 */
function smoothThrough(pts: ReadonlyArray<Pt>): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

/* ── 第一阶段：10 个课时单行成长曲线（viewBox 1200×260） ── */
const STAGE1_COORDS: Pt[] = [
  { x: 60, y: 170 }, { x: 180, y: 115 }, { x: 300, y: 150 }, { x: 420, y: 95 }, { x: 540, y: 155 },
  { x: 660, y: 100 }, { x: 780, y: 150 }, { x: 900, y: 105 }, { x: 1020, y: 160 }, { x: 1140, y: 120 },
]
const STAGE1_PATH = smoothThrough(STAGE1_COORDS)

/* 一条成长曲线（桌面 SVG 流动曲线 + 辉光节点 + 流光；含上下交替标签）。 */
function GrowthCurve({
  nodes,
  coords,
  pathD,
  vbH,
  svgTop,
  containerH,
  aboveOffset,
  pathLen,
  gradientStops,
  idPrefix,
  showDetail = true,
  labelW = 'w-[128px]',
}: {
  nodes: CurveNode[]
  coords: ReadonlyArray<Pt>
  pathD: string
  vbH: number
  svgTop: number
  containerH: number
  aboveOffset: number
  pathLen: number
  gradientStops: { offset: number; color: string }[]
  idPrefix: string
  showDetail?: boolean
  labelW?: string
}) {
  const memoPath = useMemo(() => pathD, [pathD])

  return (
    <>
      {/* 桌面端：蛇形成长曲线 */}
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
            <path d={memoPath} stroke={`url(#${idPrefix}-line)`} strokeWidth="2.4" fill="none" opacity="0.5" />
            {/* 流光线（dash 动画顺曲线流动） */}
            <path
              d={memoPath}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`46 ${pathLen}`}
              strokeLinecap="round"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="0" to={`-${pathLen + 46}`} dur="7s" repeatCount="indefinite" />
            </path>

            {/* 辉光节点（三层圆） */}
            {nodes.map((node, i) => {
              const { x, y } = coords[i]
              return (
                <g key={node.key} filter={`url(#${idPrefix}-glow)`}>
                  <circle cx={x} cy={y} r="16" fill={`url(#${idPrefix}-node-${i})`} opacity="0.55" />
                  <circle cx={x} cy={y} r="8" fill={node.theme.hex} />
                  <circle cx={x} cy={y} r="3.6" fill="#F5F5F7" />
                </g>
              )
            })}
          </svg>

          {/* 标签：上下交替 */}
          {nodes.map((node, i) => {
            const { x, y } = coords[i]
            const above = i % 2 === 0
            const leftPct = (x / 1200) * 100
            const topPx = above ? svgTop + y - aboveOffset : svgTop + y + 24
            return (
              <motion.div
                key={node.key}
                initial={{ opacity: 0, y: above ? 10 : -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute ${labelW} -translate-x-1/2 text-center`}
                style={{ left: `${leftPct}%`, top: topPx }}
              >
                {node.badge && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: node.theme.hex }}>
                    {node.badge}
                  </span>
                )}
                <h4 className="font-serif-zh mt-1 text-[13px] font-semibold leading-[1.3] text-ink sm:text-[13.5px]">{node.title}</h4>
                {showDetail && node.detail && <p className="mt-1 text-[11px] leading-[1.55] text-muted">{node.detail}</p>}
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
        <ol className="flex flex-col gap-4">
          {nodes.map((node, i) => (
            <Reveal key={node.key} delay={Math.min(i, 8) * 0.03}>
              <li className="relative pl-12">
                <span
                  aria-hidden
                  className="absolute left-[10px] top-1.5 h-[18px] w-[18px] rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${node.theme.gradientFrom} 0%, ${node.theme.gradientTo} 80%)`,
                    boxShadow: `0 0 18px ${node.theme.hex}66`,
                  }}
                />
                {node.badge && (
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: node.theme.hex }}>
                    {node.badge}
                  </span>
                )}
                <h4 className="font-serif-zh mt-1 text-[15px] font-semibold leading-[1.35] text-ink">{node.title}</h4>
                {showDetail && node.detail && <p className="mt-1 text-[12px] leading-[1.7] text-ink-soft">{node.detail}</p>}
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

const STAGE1_NODES: CurveNode[] = STAGE1_CHAPTERS.map((c) => ({
  key: `s1-${c.index}`, theme: THEMES[c.theme], badge: '', title: c.title, detail: c.deliverable,
}))
const STAGE1_STOPS = [
  { offset: 0, color: THEMES.cognition.hex }, { offset: 0.3, color: THEMES.frontend.hex },
  { offset: 0.55, color: THEMES.backend.hex }, { offset: 0.72, color: THEMES.agent.hex },
  { offset: 0.85, color: THEMES.launch.hex }, { offset: 1, color: THEMES.mindset.hex },
]

/* 第二阶段压缩为单条成长曲线：把「上/下」「一/二」等分集课时合并，14 → 11 个节点。 */
const STAGE2_CURVE: { title: string; theme: Stage2ThemeKey }[] = [
  { title: 'Claude Code 与 Codex 进阶', theme: 'advance' },
  { title: 'AI 全栈进阶', theme: 'advance' },
  { title: 'AI 测试工程', theme: 'advance' },
  { title: 'AI 运维工程', theme: 'advance' },
  { title: 'SDD 驱动编程与协作开发', theme: 'advance' },
  { title: '整洁架构与领域驱动设计', theme: 'advance' },
  { title: '大模型应用开发 · RAG 与上下文工程', theme: 'advance' },
  { title: '大模型应用开发 · 智能体与 harness', theme: 'advance' },
  { title: '企业级实战直播 · 智能问数系统', theme: 'enterprise' }, // 合并 上/下
  { title: '企业级实战直播 · Hermes/Openclaw 智能体系统', theme: 'enterprise' }, // 合并 上/下
  { title: '求职面试专题', theme: 'career' }, // 合并 一/二
]
const STAGE2_NODES: CurveNode[] = STAGE2_CURVE.map((n, i) => ({
  key: `s2-${i}`, theme: STAGE2_THEMES[n.theme], badge: '', title: n.title, detail: '',
}))
// 11 节点单行成长曲线（viewBox 1200×260），浅波浪起伏。
const STAGE2_COORDS: Pt[] = [
  { x: 60, y: 170 }, { x: 168, y: 115 }, { x: 276, y: 150 }, { x: 384, y: 95 }, { x: 492, y: 150 },
  { x: 600, y: 100 }, { x: 708, y: 155 }, { x: 816, y: 105 }, { x: 924, y: 150 }, { x: 1032, y: 110 }, { x: 1140, y: 165 },
]
const STAGE2_PATH = smoothThrough(STAGE2_COORDS)
// 渐变：能力进阶(钢蓝, 1–8) → 企业实战(暗金, 9–10) → 求职冲刺(翡翠, 11)。
const STAGE2_STOPS = [
  { offset: 0, color: STAGE2_THEMES.advance.hex }, { offset: 0.66, color: STAGE2_THEMES.advance.hex },
  { offset: 0.74, color: STAGE2_THEMES.enterprise.hex }, { offset: 0.88, color: STAGE2_THEMES.enterprise.hex },
  { offset: 0.94, color: STAGE2_THEMES.career.hex }, { offset: 1, color: STAGE2_THEMES.career.hex },
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
          coverage={AUDIENCES.stage1.coverage}
          fit={AUDIENCES.stage1.fit}
        />
      </Reveal>
      <div className="mt-4 sm:mt-6">
        <GrowthCurve
          nodes={STAGE1_NODES}
          coords={STAGE1_COORDS}
          pathD={STAGE1_PATH}
          vbH={260}
          svgTop={100}
          containerH={460}
          aboveOffset={96}
          pathLen={1300}
          gradientStops={STAGE1_STOPS}
          idPrefix="s1"
        />
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

      {/* ── 第二阶段板块（单条成长曲线，11 个合并节点） ── */}
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
        <GrowthCurve
          nodes={STAGE2_NODES}
          coords={STAGE2_COORDS}
          pathD={STAGE2_PATH}
          vbH={260}
          svgTop={90}
          containerH={440}
          aboveOffset={62}
          pathLen={1400}
          gradientStops={STAGE2_STOPS}
          idPrefix="s2"
          showDetail={false}
          labelW="w-[140px]"
        />
      </div>
    </div>
  )
}
