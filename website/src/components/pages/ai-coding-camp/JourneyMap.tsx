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

/* ─────────────────────────  全景学习路径 JourneyMap  ─────────────────────────
 * 模型：纵向时间轴 + 嵌套覆盖框，用空间包含关系直观表达「¥1999 ⊂ ¥3999」。
 * - 外层框（¥3999 职业开发者进阶）包住整条主线：第一阶段全部 + 第二阶段。
 * - 内层框（¥1999 零基础 AI 编程）嵌在外层内，只包住第一阶段的 9 个里程碑卡。
 * - 第二阶段 3 个里程碑卡在外层内、内层外 → 视觉上「¥3999 含第一阶段全部 + 更多」。
 * - 中间「LEVEL UP · 进阶解锁」分隔带：调色板/层级过渡，非付费门槛。
 * 单一响应式纵向布局（不再区分横向桌面端）：左侧渐变主轴 + 节点辉光圆点 + 右侧详情卡。
 * 数据直接映射 PROJECT_TIMELINE / STAGE2_MILESTONES，无需平行坐标数组，避免坐标与数据失配。
 * ──────────────────────────────────────────────────────────────────────── */

// 第一阶段亮色主轴渐变（认知 → 后端），用于内层框主轴。
const STAGE1_SPINE = `linear-gradient(to bottom, ${THEMES.cognition.hex}, ${THEMES.frontend.hex}, ${THEMES.backend.hex}, ${THEMES.agent.hex}, ${THEMES.launch.hex}, ${THEMES.mobile.hex})`
// 第二阶段深色主轴渐变（能力进阶 → 求职冲刺），用于第二阶段段主轴。
const STAGE2_SPINE = `linear-gradient(to bottom, ${STAGE2_THEMES.advance.hex}, ${STAGE2_THEMES.enterprise.hex}, ${STAGE2_THEMES.career.hex})`

// 内层框（¥1999）强调色：第一阶段认知 → 后端。
const STAGE1_ACCENT_FROM = THEMES.cognition.hex
const STAGE1_ACCENT_TO = THEMES.backend.hex
// 外层框（¥3999）强调色：第一阶段认知 → 第二阶段求职冲刺，跨阶段过渡。
const STAGE2_ACCENT_FROM = THEMES.cognition.hex
const STAGE2_ACCENT_TO = STAGE2_THEMES.career.hex

/* ─────────────────────────  里程碑节点圆点（复用移动端辉光做法）  ───────────────────────── */

function SpineDot({ theme }: { theme: Theme }) {
  return (
    <span
      aria-hidden
      className="absolute left-[-1px] top-1.5 z-10 h-[18px] w-[18px] -translate-x-1/2 rounded-full sm:h-[20px] sm:w-[20px]"
      style={{
        background: `radial-gradient(circle, ${theme.gradientFrom} 0%, ${theme.gradientTo} 80%)`,
        boxShadow: `0 0 18px ${theme.hex}66, 0 0 0 4px rgba(5,5,7,0.6)`,
      }}
    />
  )
}

/* ─────────────────────────  第一阶段里程碑卡  ───────────────────────── */

function Stage1Card({ chapter, milestone, detail, theme }: { chapter: string; milestone: string; detail: string; theme: Theme }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md sm:rounded-[20px] sm:p-5 lg:p-6"
      style={{
        borderColor: `rgba(${theme.rgb}, 0.22)`,
        background: `linear-gradient(120deg, rgba(${theme.rgb}, 0.10) 0%, rgba(13,13,18,0.55) 60%)`,
        boxShadow: `inset 2px 0 0 0 rgba(${theme.rgb}, 0.55), inset 0 0 0 1px rgba(${theme.rgb}, 0.05)`,
      }}
    >
      {/* 右下角超大半透明里程碑名首字（弱化装饰） */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-3 -right-1 select-none font-mono text-[88px] font-black leading-none tabular sm:text-[120px]"
        style={{ color: theme.hex, opacity: 0.05 }}
      >
        {milestone.slice(0, 1)}
      </span>
      <div className="relative flex flex-col gap-1.5 sm:gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] sm:text-[11.5px]" style={{ color: theme.hex }}>
          {chapter} · {theme.label}
        </span>
        <h4 className="font-serif-zh text-[16px] font-semibold leading-[1.35] text-ink sm:text-[18px]">
          {milestone}
        </h4>
        <p className="text-[12.5px] leading-[1.7] text-ink-soft sm:text-[13px]">{detail}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────  第二阶段里程碑卡（职业硬核深色系）  ───────────────────────── */

function Stage2Card({ label, range, gain, theme }: { label: string; range: string; gain: string; theme: Theme }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md sm:rounded-[20px] sm:p-5 lg:p-6"
      style={{
        borderColor: `rgba(${theme.rgb}, 0.30)`,
        background: `linear-gradient(120deg, rgba(${theme.rgb}, 0.12) 0%, rgba(8,8,12,0.7) 60%)`,
        boxShadow: `inset 2px 0 0 0 rgba(${theme.rgb}, 0.6), inset 0 0 0 1px rgba(${theme.rgb}, 0.06)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-3 -right-1 select-none font-mono text-[88px] font-black leading-none tabular sm:text-[120px]"
        style={{ color: theme.hex, opacity: 0.05 }}
      >
        {label.slice(0, 1)}
      </span>
      <div className="relative flex flex-col gap-1.5 sm:gap-2">
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px]"
          style={{ color: theme.hex, background: `${theme.hex}1f` }}
        >
          {label} · {range}
        </span>
        <h4 className="font-serif-zh text-[16px] font-semibold leading-[1.4] text-ink sm:text-[18px]">
          {gain}
        </h4>
      </div>
    </div>
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

/* ─────────────────────────  起点 / 终点小标  ───────────────────────── */

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

      {/* 起点小标 */}
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

          {/* ───────────── 内层框：¥1999 零基础 AI 编程（包住第一阶段 9 卡） ───────────── */}
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

            {/* 第一阶段纵向主线 + 9 张里程碑卡 */}
            <div className="relative mt-5 pl-8 sm:mt-6 sm:pl-10">
              <span
                aria-hidden
                className="absolute left-[7px] top-2 bottom-2 w-[2px] sm:left-[9px]"
                style={{ background: STAGE1_SPINE, opacity: 0.65 }}
              />
              <ol className="flex flex-col gap-5 sm:gap-6">
                {PROJECT_TIMELINE.map((node, i) => {
                  const t = THEMES[node.theme]
                  return (
                    <Reveal key={`s1-${node.chapter}`} delay={Math.min(i, 5) * 0.03}>
                      <li className="relative">
                        <SpineDot theme={t} />
                        <Stage1Card chapter={node.chapter} milestone={node.milestone} detail={node.detail} theme={t} />
                      </li>
                    </Reveal>
                  )
                })}
              </ol>
            </div>
          </div>

          {/* ───────────── LEVEL UP 分隔带（内层框外、外层框内） ───────────── */}
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

          {/* ───────────── 第二阶段纵向主线 + 3 张里程碑卡（外层框内、内层框外） ───────────── */}
          <div className="relative mt-5 pl-8 sm:mt-6 sm:pl-10">
            <span
              aria-hidden
              className="absolute left-[7px] top-2 bottom-2 w-[2px] sm:left-[9px]"
              style={{ background: STAGE2_SPINE, opacity: 0.7 }}
            />
            <ol className="flex flex-col gap-5 sm:gap-6">
              {STAGE2_MILESTONES.map((m, i) => {
                const t = STAGE2_THEMES[m.theme]
                return (
                  <Reveal key={`s2-${m.label}`} delay={i * 0.04}>
                    <li className="relative">
                      <SpineDot theme={t} />
                      <Stage2Card label={m.label} range={m.range} gain={m.gain} theme={t} />
                    </li>
                  </Reveal>
                )
              })}
            </ol>
          </div>
        </div>
      </Reveal>

      {/* 终点小标 */}
      <Reveal delay={0.04}>
        <div className="mt-3 sm:mt-4">
          <JourneyCap label="终点" text="独立交付企业级应用 + 拿到 offer 的实战与话术" />
        </div>
      </Reveal>
    </div>
  )
}
