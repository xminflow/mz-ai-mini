'use client'

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

/* ─────────────────────────  全景学习路径 JourneyMap（XMind 思维导图式）  ─────────────────────────
 * 模型：纵向主干（时间轴）+ 弯曲分枝 + 收获叶子，整体读作一张思维导图，而非卡片堆叠。
 * - 纵向主干（trunk）：贯穿全程的一条渐变竖线，从第一阶段七彩 → LEVEL UP 过渡 → 第二阶段职业深色系。
 * - 每个里程碑 = 从主干弯出的一条分枝（SVG 三次贝塞尔曲线），扫向右侧的「主题节点」气泡。
 * - 主题节点再生出一条更细的子分枝到「收获叶子」，形成「主干 → 节点 → 收获」两级分叉。
 * - 嵌套覆盖框：外框（¥3999）包住内框（¥1999），用空间包含直观表达「¥1999 ⊂ ¥3999」。
 *   内框只包第一阶段主干+分枝；第二阶段主干+分枝在外框内、内框外。
 * - LEVEL UP 分隔带：调色板/层级过渡，非付费门槛。
 *
 * 布局稳健性：不使用任何全局坐标数组或全局 Y 计算。
 * - 每一行（里程碑）= 一个 flow 布局的行，行内左侧是一条固定宽度的「分枝车道」(branch-lane)，
 *   车道内放一个本地 inline <svg>（viewBox 固定、preserveAspectRatio 自适应缩放），
 *   贝塞尔曲线从车道左侧（主干侧）弯到右侧（节点侧）。节点与收获叶子在正常 flow 中，高度自动。
 * - 主干是一条绝对定位的渐变竖线，置于所有行之后；每行的主干辉光圆点绝对定位在车道左侧、垂直居中。
 * 数据直接映射 PROJECT_TIMELINE / STAGE2_MILESTONES，无平行坐标，避免坐标与数据失配。
 * ──────────────────────────────────────────────────────────────────────── */

// 第一阶段亮色主干渐变（认知 → 工程心智），用于内层框主干。
const STAGE1_TRUNK = `linear-gradient(to bottom, ${THEMES.cognition.hex}, ${THEMES.frontend.hex}, ${THEMES.backend.hex}, ${THEMES.agent.hex}, ${THEMES.launch.hex}, ${THEMES.mobile.hex}, ${THEMES.mindset.hex})`
// 第二阶段深色主干渐变（能力进阶 → 求职冲刺），用于第二阶段段主干。
const STAGE2_TRUNK = `linear-gradient(to bottom, ${STAGE2_THEMES.advance.hex}, ${STAGE2_THEMES.enterprise.hex}, ${STAGE2_THEMES.career.hex})`

// 内层框（¥1999）强调色：第一阶段认知 → 后端。
const STAGE1_ACCENT_FROM = THEMES.cognition.hex
const STAGE1_ACCENT_TO = THEMES.backend.hex
// 外层框（¥3999）强调色：第一阶段认知 → 第二阶段求职冲刺，跨阶段过渡。
const STAGE2_ACCENT_FROM = THEMES.cognition.hex
const STAGE2_ACCENT_TO = STAGE2_THEMES.career.hex

/* ─────────────────────────  弯曲分枝行（XMind 核心元素）  ─────────────────────────
 * 一行 = 主干辉光圆点 + 弯曲主分枝 + 主题节点气泡 + 细子分枝 + 收获叶子。
 * 车道用 viewBox="0 0 100 100" 的本地 SVG，贝塞尔从左中(0,50)弯到右上(100,~26)，
 * preserveAspectRatio="none" 让曲线随车道宽高自适应——天然响应式，无需全局坐标。 */

function BranchRow({
  theme,
  topic,
  leaf,
  prominentLeaf = false,
  laneClassName,
}: {
  theme: Theme
  topic: string
  leaf: string
  prominentLeaf?: boolean
  laneClassName: string
}) {
  return (
    <li className="relative flex items-stretch">
      {/* ── 主干辉光圆点：绝对定位在车道最左、整行垂直居中（即主干分叉点） ── */}
      <span
        aria-hidden
        className="absolute left-[-5px] top-1/2 z-20 h-[15px] w-[15px] -translate-y-1/2 rounded-full sm:left-[-6px] sm:h-[17px] sm:w-[17px]"
        style={{
          background: `radial-gradient(circle, ${theme.gradientFrom} 0%, ${theme.gradientTo} 80%)`,
          boxShadow: `0 0 14px ${theme.hex}88, 0 0 0 3px rgba(5,5,7,0.7)`,
        }}
      />

      {/* ── 分枝车道：本地 SVG 画一条从主干弯向节点的主分枝曲线 ── */}
      <span aria-hidden className={`relative flex-none self-stretch ${laneClassName}`}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          {/* 主分枝：从主干侧(0,50) 三次贝塞尔上扬到节点侧(100,28)，有主题色描边 + 柔光 */}
          <path
            d="M 0 50 C 42 50 56 28 100 28"
            fill="none"
            stroke={theme.hex}
            strokeWidth={2.4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: `drop-shadow(0 0 4px ${theme.hex}88)`, opacity: 0.92 }}
          />
        </svg>
      </span>

      {/* ── 右侧：主题节点气泡 + 子分枝 + 收获叶子（正常 flow，高度自动） ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1.5 sm:gap-2">
        {/* 主题节点气泡（紧凑 chip，非内容大卡） */}
        <span
          className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5"
          style={{
            borderColor: `rgba(${theme.rgb}, 0.5)`,
            background: `linear-gradient(120deg, rgba(${theme.rgb}, 0.22) 0%, rgba(${theme.rgb}, 0.08) 100%)`,
            boxShadow: `0 0 16px -4px ${theme.hex}77, inset 0 0 0 1px rgba(${theme.rgb}, 0.12)`,
          }}
        >
          <span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 flex-none rounded-full"
            style={{ background: theme.hex, boxShadow: `0 0 6px ${theme.hex}` }}
          />
          <span
            className="truncate font-serif-zh text-[13px] font-semibold leading-tight sm:text-[14.5px]"
            style={{ color: theme.hex }}
          >
            {topic}
          </span>
        </span>

        {/* 子分枝 + 收获叶子：更细的曲线 prefix（用 SVG 画一小段 elbow）+ 文本 */}
        <span className="flex items-start gap-1.5 pl-1 sm:pl-2">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            preserveAspectRatio="none"
            className="mt-1 h-[14px] w-[16px] flex-none overflow-visible sm:h-[16px] sm:w-[18px]"
          >
            {/* 细子分枝：从节点下方(2,0)弯到叶子(24,18) */}
            <path
              d="M 2 0 C 2 12 10 18 24 18"
              fill="none"
              stroke={theme.hex}
              strokeWidth={1.4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ opacity: 0.7 }}
            />
          </svg>
          <span
            className={
              prominentLeaf
                ? 'min-w-0 font-serif-zh text-[13px] font-medium leading-[1.5] text-ink sm:text-[14px]'
                : 'min-w-0 text-[11.5px] leading-[1.55] text-ink-soft sm:text-[12.5px]'
            }
          >
            <span
              className="mr-1 font-mono text-[10px] uppercase tracking-[0.1em]"
              style={{ color: `rgba(${theme.rgb}, 0.85)` }}
            >
              收获
            </span>
            {leaf}
          </span>
        </span>
      </div>
    </li>
  )
}

/* ─────────────────────────  框头：价格 + 适合人群 + 覆盖范围  ───────────────────────── */

function FrameHeader({
  name,
  price,
  originalPrice,
  includesBadge,
  fit,
  coverage,
  accentFrom,
  accentTo,
  full = false,
}: {
  name: string
  price: string
  originalPrice?: string
  includesBadge?: string
  fit: string
  coverage: string
  accentFrom: string
  accentTo: string
  full?: boolean
}) {
  const gradient = `linear-gradient(90deg, ${accentFrom}, ${accentTo})`
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-serif-zh text-[16px] font-bold text-ink sm:text-[18px]">{name}</span>
        {includesBadge && (
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink sm:text-[10px]"
            style={{ background: gradient, boxShadow: `0 4px 14px -3px ${accentTo}aa` }}
          >
            {includesBadge}
          </span>
        )}
        <span className="flex items-baseline gap-1.5">
          {originalPrice && (
            <span className="font-mono text-[11px] text-muted line-through tabular sm:text-[12px]">原价 {originalPrice}</span>
          )}
          <span
            className="font-serif-zh text-[20px] font-bold tabular sm:text-[24px]"
            style={{ color: full ? '#FECDD3' : accentFrom, textShadow: `0 0 16px ${accentTo}66` }}
          >
            {price}
          </span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:text-[10.5px]">{coverage}</span>
      </div>
      <p className="text-[12px] leading-[1.6] text-ink-soft sm:text-[12.5px]">适合：{fit}</p>
    </div>
  )
}

/* ─────────────────────────  起点 / 终点小标（主干两端的 cap）  ───────────────────────── */

function JourneyCap({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center gap-2.5 pl-1 text-muted">
      <span aria-hidden className="inline-flex h-2 w-2 rounded-full" style={{ background: 'rgba(255,255,255,0.35)' }} />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] sm:text-[10.5px]">{label}</span>
      <span className="text-[12px] leading-[1.5] text-ink-soft sm:text-[12.5px]">{text}</span>
    </div>
  )
}

export function JourneyMap() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* 嵌套关系说明 */}
      <Reveal>
        <p className="mb-4 text-center text-[11.5px] leading-[1.6] text-muted sm:mb-5 sm:text-[12px]">
          外层 ¥3999 含第一阶段全部内容，内层 ¥1999 仅覆盖第一阶段
        </p>
      </Reveal>

      {/* 起点小标（主干顶端 cap） */}
      <Reveal>
        <div className="mb-3 sm:mb-4">
          <JourneyCap label="起点" text="零基础，不用看一行代码" />
        </div>
      </Reveal>

      {/* ───────────── 外层框：¥3999 职业开发者进阶 ───────────── */}
      <Reveal delay={0.04}>
        <div
          className="relative rounded-[24px] border p-4 sm:rounded-[28px] sm:p-6 lg:p-7"
          style={{
            borderColor: `${STAGE2_ACCENT_TO}55`,
            background: `linear-gradient(135deg, ${STAGE2_ACCENT_FROM}0f 0%, ${STAGE2_ACCENT_TO}14 100%)`,
            boxShadow: `0 0 40px -16px ${STAGE2_ACCENT_TO}66`,
          }}
        >
          {/* 外层框头 */}
          <FrameHeader
            name={AUDIENCES.stage2.name}
            price={STAGE2_PRICE.now}
            includesBadge={STAGE2_PRICE.includes}
            fit={AUDIENCES.stage2.fit}
            coverage={AUDIENCES.stage2.coverage}
            accentFrom={STAGE2_ACCENT_FROM}
            accentTo={STAGE2_ACCENT_TO}
            full
          />

          {/* ───────────── 内层框：¥1999 零基础 AI 编程（包住第一阶段主干+分枝） ───────────── */}
          <div
            className="relative mt-5 rounded-[20px] border p-4 sm:mt-6 sm:rounded-[24px] sm:p-5 lg:p-6"
            style={{
              borderColor: `${STAGE1_ACCENT_TO}55`,
              background: `linear-gradient(135deg, ${STAGE1_ACCENT_FROM}0f 0%, ${STAGE1_ACCENT_TO}14 100%)`,
              boxShadow: `inset 0 0 0 1px ${STAGE1_ACCENT_FROM}14`,
            }}
          >
            {/* 内层框头 */}
            <FrameHeader
              name={AUDIENCES.stage1.name}
              price={STAGE1_PRICE.now}
              originalPrice={STAGE1_PRICE.original}
              fit={AUDIENCES.stage1.fit}
              coverage={AUDIENCES.stage1.coverage}
              accentFrom={STAGE1_ACCENT_FROM}
              accentTo={STAGE1_ACCENT_TO}
            />

            {/* 第一阶段纵向主干 + 9 条弯曲分枝 */}
            <div className="relative mt-5 pl-3 sm:mt-6 sm:pl-4">
              {/* 主干竖线（绝对定位，置于所有行之后） */}
              <span
                aria-hidden
                className="absolute left-[7px] top-0 bottom-0 w-[2.5px] rounded-full sm:left-[9px]"
                style={{ background: STAGE1_TRUNK, opacity: 0.8, boxShadow: `0 0 10px ${STAGE1_ACCENT_FROM}44` }}
              />
              <ol className="relative flex flex-col">
                {PROJECT_TIMELINE.map((node, i) => {
                  const t = THEMES[node.theme]
                  return (
                    <Reveal key={`s1-${node.chapter}`} delay={Math.min(i, 5) * 0.03}>
                      <BranchRow
                        theme={t}
                        topic={`${node.chapter} · ${node.milestone}`}
                        leaf={node.detail}
                        laneClassName="w-[52px] sm:w-[68px]"
                      />
                    </Reveal>
                  )
                })}
              </ol>
            </div>
          </div>

          {/* ───────────── LEVEL UP 分隔带（横跨主干，内层框外、外层框内） ───────────── */}
          <Reveal delay={0.04}>
            <div
              className="relative mt-5 flex items-center gap-3 rounded-2xl border px-4 py-2.5 sm:mt-6 sm:px-5 sm:py-3"
              style={{
                borderColor: `${STAGE2_THEMES.advance.hex}55`,
                background: `linear-gradient(110deg, ${THEMES.mobile.hex}1a, ${STAGE2_THEMES.advance.hex}26)`,
                boxShadow: `0 0 24px -8px ${STAGE2_THEMES.advance.hex}66`,
              }}
            >
              <span
                aria-hidden
                className="inline-flex h-2 w-2 flex-none animate-pulse rounded-full"
                style={{ background: STAGE2_THEMES.advance.hex }}
              />
              <span
                className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] sm:text-[11.5px]"
                style={{ color: STAGE2_THEMES.advance.hex }}
              >
                LEVEL UP · 进阶解锁 · 第二阶段
              </span>
              <span className="hidden text-[11.5px] leading-[1.5] text-muted sm:inline">
                从明快七彩切换到职业硬核深色系，能力继续上扬。
              </span>
            </div>
          </Reveal>

          {/* ───────────── 第二阶段纵向主干 + 3 条弯曲分枝（外层框内、内层框外） ───────────── */}
          <div className="relative mt-5 pl-3 sm:mt-6 sm:pl-4">
            <span
              aria-hidden
              className="absolute left-[7px] top-0 bottom-0 w-[2.5px] rounded-full sm:left-[9px]"
              style={{ background: STAGE2_TRUNK, opacity: 0.85, boxShadow: `0 0 10px ${STAGE2_THEMES.advance.hex}44` }}
            />
            <ol className="relative flex flex-col">
              {STAGE2_MILESTONES.map((m, i) => {
                const t = STAGE2_THEMES[m.theme]
                return (
                  <Reveal key={`s2-${m.label}`} delay={i * 0.04}>
                    <BranchRow
                      theme={t}
                      topic={`${m.label} · ${m.range}`}
                      leaf={m.gain}
                      prominentLeaf
                      laneClassName="w-[52px] sm:w-[68px]"
                    />
                  </Reveal>
                )
              })}
            </ol>
          </div>
        </div>
      </Reveal>

      {/* 终点小标（主干底端 cap） */}
      <Reveal delay={0.04}>
        <div className="mt-3 sm:mt-4">
          <JourneyCap label="终点" text="独立交付企业级应用 + 拿到 offer 的实战与话术" />
        </div>
      </Reveal>
    </div>
  )
}
