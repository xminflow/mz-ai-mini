'use client'

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

/* ─────────────────────────  全景学习路径 JourneyMap  ─────────────────────────
 * 模型：一条完整主线（全旅程）+ 主线下方两条「购买覆盖范围括号」。
 * - 前 9 个节点 = 第一阶段（PROJECT_TIMELINE，明快七彩）。
 * - 后 3 个节点 = 第二阶段（STAGE2_MILESTONES，深色职业系）。
 * - 中间「LEVEL UP · 进阶解锁」分隔标识：调色板/层级过渡，非付费门槛。
 * 复用 CapabilityTimeline 的成熟做法：SVG 平滑主线 + 流光 dash 动画 + 节点辉光滤镜 + 移动端竖向时间线。
 * ──────────────────────────────────────────────────────────────────────── */

// viewBox：宽 1200，主线沿浅波浪线分布。第一阶段占左 ~58%，第二阶段占右 ~42%。
const VB_W = 1200
const VB_H = 280

// 第一阶段 9 节点：x 落在 60~660（约 5%~55%），交替起伏的波浪。
const STAGE1_XY: ReadonlyArray<{ x: number; y: number }> = [
  { x: 60, y: 175 },
  { x: 135, y: 130 },
  { x: 210, y: 160 },
  { x: 285, y: 110 },
  { x: 360, y: 150 },
  { x: 435, y: 105 },
  { x: 510, y: 150 },
  { x: 585, y: 100 },
  { x: 660, y: 140 },
]

// 分隔点：第一阶段末与第二阶段首之间。
const DIVIDER_X = 720

// 第二阶段 3 节点：x 落在 810~1140（约 67%~95%），台阶式上扬，象征「进阶上升」。
const STAGE2_XY: ReadonlyArray<{ x: number; y: number }> = [
  { x: 825, y: 120 },
  { x: 980, y: 95 },
  { x: 1135, y: 70 },
]

// 由全部 12 个有序节点生成一条平滑波浪主线（Catmull-Rom 思路的二次贝塞尔近似）。
function buildJourneyPath(points: ReadonlyArray<{ x: number; y: number }>): string {
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const cur = points[i]
    const next = points[i + 1]
    const cx = (cur.x + next.x) / 2
    d += ` Q ${cx} ${cur.y}, ${cx} ${(cur.y + next.y) / 2} T ${next.x} ${next.y}`
  }
  return d
}

const ALL_XY = [...STAGE1_XY, ...STAGE2_XY]
const JOURNEY_PATH = buildJourneyPath(ALL_XY)

// 主线渐变停靠点：第一阶段亮色 → 分隔处 → 第二阶段深色，跨分隔可见过渡。
const stage1Colors = [
  THEMES.cognition.hex,
  THEMES.frontend.hex,
  THEMES.backend.hex,
  THEMES.agent.hex,
  THEMES.launch.hex,
  THEMES.mobile.hex,
]
const stage2Colors = [
  STAGE2_THEMES.advance.hex,
  STAGE2_THEMES.enterprise.hex,
  STAGE2_THEMES.career.hex,
]

// 节点辉光节点单元（复用 CapabilityTimeline 的三层圆 + 辉光做法）。
function GlowNode({ x, y, theme }: { x: number; y: number; theme: Theme }) {
  return (
    <g filter="url(#journey-glow)">
      <circle cx={x} cy={y} r="17" fill={theme.gradientFrom} opacity="0.28" />
      <circle cx={x} cy={y} r="9" fill={theme.hex} />
      <circle cx={x} cy={y} r="3.6" fill="#F5F5F7" />
    </g>
  )
}

export function JourneyMap() {
  return (
    <>
      {/* ───────────── 桌面端：横向全景主线 ───────────── */}
      <div className="relative hidden lg:block">
        <div className="relative h-[300px] w-full">
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="absolute inset-x-0 top-0 h-[280px] w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="journey-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={stage1Colors[0]} stopOpacity="0.95" />
                <stop offset="0.18" stopColor={stage1Colors[1]} stopOpacity="0.95" />
                <stop offset="0.34" stopColor={stage1Colors[2]} stopOpacity="0.95" />
                <stop offset="0.46" stopColor={stage1Colors[3]} stopOpacity="0.95" />
                <stop offset="0.55" stopColor={stage1Colors[4]} stopOpacity="0.95" />
                {/* 分隔处：亮色末尾过渡到第二阶段首色 */}
                <stop offset="0.6" stopColor={stage1Colors[5]} stopOpacity="0.9" />
                <stop offset="0.7" stopColor={stage2Colors[0]} stopOpacity="0.95" />
                <stop offset="0.85" stopColor={stage2Colors[1]} stopOpacity="0.95" />
                <stop offset="1" stopColor={stage2Colors[2]} stopOpacity="0.95" />
              </linearGradient>
              <filter id="journey-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 底层虚化主线 */}
            <path d={JOURNEY_PATH} stroke="url(#journey-line)" strokeWidth="2.4" fill="none" opacity="0.5" />
            {/* 流光线（dash 动画运行光，仅一条，保证性能） */}
            <path
              d={JOURNEY_PATH}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray="42 1500"
              strokeLinecap="round"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-1542" dur="7s" repeatCount="indefinite" />
            </path>

            {/* 分隔竖线：从第一阶段末色过渡到第二阶段首色（层级/调色板过渡，非付费门槛） */}
            <line
              x1={DIVIDER_X}
              y1="30"
              x2={DIVIDER_X}
              y2="250"
              stroke="url(#journey-divider)"
              strokeWidth="2"
              strokeDasharray="5 5"
              opacity="0.7"
            />
            <linearGradient id="journey-divider" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={stage1Colors[5]} stopOpacity="0" />
              <stop offset="0.5" stopColor={stage2Colors[0]} stopOpacity="0.9" />
              <stop offset="1" stopColor={stage2Colors[0]} stopOpacity="0" />
            </linearGradient>

            {/* 第一阶段节点 */}
            {STAGE1_XY.map((p, i) => (
              <GlowNode key={`s1-${i}`} x={p.x} y={p.y} theme={THEMES[PROJECT_TIMELINE[i].theme]} />
            ))}
            {/* 第二阶段节点 */}
            {STAGE2_XY.map((p, i) => (
              <GlowNode key={`s2-${i}`} x={p.x} y={p.y} theme={STAGE2_THEMES[STAGE2_MILESTONES[i].theme]} />
            ))}
          </svg>

          {/* ── LEVEL UP 分隔徽标（绝对定位在分隔点上方） ── */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(DIVIDER_X / VB_W) * 100}%`, top: '14%' }}
          >
            <span
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink"
              style={{
                borderColor: `${stage2Colors[0]}66`,
                background: `linear-gradient(110deg, ${stage1Colors[5]}22, ${stage2Colors[0]}33)`,
                boxShadow: `0 0 22px -4px ${stage2Colors[0]}88`,
              }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: stage2Colors[0] }} />
              LEVEL UP · 进阶解锁
            </span>
          </div>

          {/* ── 第一阶段标签：上下交替 ── */}
          {STAGE1_XY.map((p, i) => {
            const node = PROJECT_TIMELINE[i]
            const t = THEMES[node.theme]
            const above = i % 2 === 1
            const leftPct = (p.x / VB_W) * 100
            const topPx = above ? (p.y / VB_H) * 280 - 86 : (p.y / VB_H) * 280 + 26
            return (
              <motion.div
                key={`s1-label-${i}`}
                initial={{ opacity: 0, y: above ? 10 : -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-[112px] -translate-x-1/2 text-center"
                style={{ left: `${leftPct}%`, top: topPx }}
              >
                <span className="font-mono text-[9.5px] uppercase tracking-[0.16em]" style={{ color: t.hex }}>
                  {node.chapter}
                </span>
                <h4 className="font-serif-zh mt-0.5 text-[12.5px] font-semibold leading-[1.3] text-ink">
                  {node.milestone}
                </h4>
              </motion.div>
            )
          })}

          {/* ── 第二阶段标签：突出「收获」 ── */}
          {STAGE2_XY.map((p, i) => {
            const m = STAGE2_MILESTONES[i]
            const t = STAGE2_THEMES[m.theme]
            const above = i % 2 === 1
            const leftPct = (p.x / VB_W) * 100
            const topPx = above ? (p.y / VB_H) * 280 - 100 : (p.y / VB_H) * 280 + 26
            return (
              <motion.div
                key={`s2-label-${i}`}
                initial={{ opacity: 0, y: above ? 10 : -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.04 * (i + 9), ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-[150px] -translate-x-1/2 text-center"
                style={{ left: `${leftPct}%`, top: topPx }}
              >
                <span
                  className="inline-block rounded-full px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: t.hex, background: `${t.hex}1f` }}
                >
                  {m.label}
                </span>
                <p className="mt-1 text-[11px] font-medium leading-[1.5] text-ink-soft">{m.gain}</p>
              </motion.div>
            )
          })}
        </div>

        {/* ───────────── 两条购买覆盖范围括号（HTML，位于主线下方） ─────────────
         * left/width 百分比按节点 x 坐标「目测对齐」：
         * - 第一阶段节点 x ∈ [60, 660] → 视口 5%~55%；括号取 left 3% / width 56% 覆盖前段。
         * - 全程节点 x ∈ [60, 1135] → 视口 5%~95%；括号取 left 3% / width 94% 覆盖整线。
         */}
        <div className="relative mt-3 h-[150px] w-full">
          {/* 括号 1：第一阶段 ¥1999，仅覆盖前段 */}
          <CoverageBracket
            top={6}
            left={3}
            width={56}
            accentFrom={THEMES.cognition.hex}
            accentTo={THEMES.backend.hex}
            audience={AUDIENCES.stage1}
            price={STAGE1_PRICE.now}
            originalPrice={STAGE1_PRICE.original}
          />
          {/* 括号 2：第二阶段 ¥3999，覆盖整线，标注「含第一阶段全部」 */}
          <CoverageBracket
            top={74}
            left={3}
            width={94}
            accentFrom={THEMES.cognition.hex}
            accentTo={STAGE2_THEMES.career.hex}
            audience={AUDIENCES.stage2}
            price={STAGE2_PRICE.now}
            includesBadge={STAGE2_PRICE.includes}
            full
          />
        </div>
      </div>

      {/* ───────────── 移动端：竖向时间线 + 两张覆盖卡 ───────────── */}
      <div className="relative lg:hidden">
        <div
          aria-hidden
          className="absolute left-[18px] top-2 bottom-2 w-px"
          style={{
            background: `linear-gradient(to bottom, ${stage1Colors[0]}, ${stage1Colors[2]}, ${stage1Colors[4]}, ${stage2Colors[0]}, ${stage2Colors[2]})`,
            opacity: 0.55,
          }}
        />
        <ol className="flex flex-col gap-5">
          {/* 第一阶段节点 */}
          {PROJECT_TIMELINE.map((node, i) => {
            const t = THEMES[node.theme]
            return (
              <Reveal key={`m-s1-${node.chapter}`} delay={i * 0.03}>
                <li className="relative pl-12">
                  <span
                    aria-hidden
                    className="absolute left-[10px] top-1.5 h-[18px] w-[18px] rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: t.hex }}>
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

          {/* 进阶解锁分隔卡 */}
          <Reveal delay={0.05}>
            <li className="relative pl-12">
              <span
                aria-hidden
                className="absolute left-[10px] top-1.5 h-[18px] w-[18px] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${stage2Colors[0]} 0%, ${STAGE2_THEMES.advance.gradientTo} 80%)`,
                  boxShadow: `0 0 18px ${stage2Colors[0]}88`,
                }}
              />
              <div
                className="rounded-xl border px-3 py-2"
                style={{
                  borderColor: `${stage2Colors[0]}55`,
                  background: `linear-gradient(110deg, ${stage1Colors[5]}1a, ${stage2Colors[0]}26)`,
                }}
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: stage2Colors[0] }}>
                  LEVEL UP · 进阶解锁 · 第二阶段
                </span>
                <p className="mt-0.5 text-[11.5px] leading-[1.6] text-muted">从明快七彩切换到职业硬核深色系，能力继续上扬。</p>
              </div>
            </li>
          </Reveal>

          {/* 第二阶段里程碑 */}
          {STAGE2_MILESTONES.map((m, i) => {
            const t = STAGE2_THEMES[m.theme]
            return (
              <Reveal key={`m-s2-${m.label}`} delay={i * 0.03}>
                <li className="relative pl-12">
                  <span
                    aria-hidden
                    className="absolute left-[10px] top-1.5 h-[18px] w-[18px] rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: t.hex }}>
                    {m.label}
                  </span>
                  <p className="mt-1 text-[12.5px] font-medium leading-[1.6] text-ink">{m.gain}</p>
                </li>
              </Reveal>
            )
          })}
        </ol>

        {/* 两张覆盖卡 */}
        <div className="mt-8 flex flex-col gap-4">
          <CoverageCard
            accentFrom={THEMES.cognition.hex}
            accentTo={THEMES.backend.hex}
            audience={AUDIENCES.stage1}
            price={STAGE1_PRICE.now}
            originalPrice={STAGE1_PRICE.original}
          />
          <CoverageCard
            accentFrom={THEMES.cognition.hex}
            accentTo={STAGE2_THEMES.career.hex}
            audience={AUDIENCES.stage2}
            price={STAGE2_PRICE.now}
            includesBadge={STAGE2_PRICE.includes}
            full
          />
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────  覆盖范围括号（桌面）  ───────────────────────── */

type Audience = { name: string; price: string; coverage: string; fit: string }

function CoverageBracket({
  top,
  left,
  width,
  accentFrom,
  accentTo,
  audience,
  price,
  originalPrice,
  includesBadge,
  full = false,
}: {
  top: number
  left: number
  width: number
  accentFrom: string
  accentTo: string
  audience: Audience
  price: string
  originalPrice?: string
  includesBadge?: string
  full?: boolean
}) {
  const gradient = `linear-gradient(90deg, ${accentFrom}, ${accentTo})`
  return (
    <div className="absolute" style={{ top, left: `${left}%`, width: `${width}%` }}>
      {/* 横杆 + 两端端帽（┤ ├ 观感） */}
      <div className="relative h-[14px]">
        <span aria-hidden className="absolute left-0 top-0 h-[14px] w-[2px]" style={{ background: gradient }} />
        <span aria-hidden className="absolute right-0 top-0 h-[14px] w-[2px]" style={{ background: gradient }} />
        <span
          aria-hidden
          className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2"
          style={{ background: gradient, opacity: 0.85 }}
        />
        {/* 中央向下指示小三角 */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
          style={{ background: accentTo }}
        />
      </div>
      {/* 标签卡 */}
      <div
        className="mt-2 inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-2.5 backdrop-blur-md"
        style={{
          borderColor: `${accentTo}66`,
          background: `linear-gradient(110deg, ${accentFrom}14, ${accentTo}1a)`,
          boxShadow: `0 0 28px -8px ${accentTo}66`,
        }}
      >
        <span className="font-serif-zh text-[14px] font-bold text-ink">{audience.name}</span>
        {includesBadge && (
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink"
            style={{ background: gradient, boxShadow: `0 4px 14px -3px ${accentTo}aa` }}
          >
            {includesBadge}
          </span>
        )}
        <span className="flex items-baseline gap-1.5">
          {originalPrice && (
            <span className="font-mono text-[11px] text-muted line-through tabular">{originalPrice}</span>
          )}
          <span
            className="font-serif-zh text-[18px] font-bold tabular"
            style={{ color: full ? '#FECDD3' : accentFrom, textShadow: `0 0 16px ${accentTo}66` }}
          >
            {price}
          </span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{audience.coverage}</span>
        <span className="basis-full text-[11px] leading-[1.5] text-ink-soft">适合：{audience.fit}</span>
      </div>
    </div>
  )
}

/* ─────────────────────────  覆盖卡（移动端）  ───────────────────────── */

function CoverageCard({
  accentFrom,
  accentTo,
  audience,
  price,
  originalPrice,
  includesBadge,
  full = false,
}: {
  accentFrom: string
  accentTo: string
  audience: Audience
  price: string
  originalPrice?: string
  includesBadge?: string
  full?: boolean
}) {
  const gradient = `linear-gradient(90deg, ${accentFrom}, ${accentTo})`
  return (
    <div
      className="rounded-2xl border p-4 backdrop-blur-md"
      style={{
        borderColor: `${accentTo}55`,
        background: `linear-gradient(120deg, ${accentFrom}12, ${accentTo}1a)`,
        boxShadow: `0 0 26px -10px ${accentTo}66`,
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-serif-zh text-[15px] font-bold text-ink">{audience.name}</span>
        {includesBadge && (
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink"
            style={{ background: gradient, boxShadow: `0 4px 14px -3px ${accentTo}aa` }}
          >
            {includesBadge}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        {originalPrice && (
          <span className="font-mono text-[12px] text-muted line-through tabular">{originalPrice}</span>
        )}
        <span
          className="font-serif-zh text-[22px] font-bold tabular"
          style={{ color: full ? '#FECDD3' : accentFrom, textShadow: `0 0 16px ${accentTo}66` }}
        >
          {price}
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{audience.coverage}</span>
      </div>
      <p className="mt-2 text-[12px] leading-[1.7] text-ink-soft">适合：{audience.fit}</p>
    </div>
  )
}
