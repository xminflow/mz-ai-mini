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

/* ─────────────────────────  全景学习路径 JourneyMap（简洁时间轴里程碑）  ─────────────────────────
 * 设计原则：简洁。一条贯穿全程的时间轴竖线 + 里程碑圆点 + 纯文字（课时号 / 标题 / 收获一行）。
 * 不用嵌套框、不用每行卡片——避免「盒子套盒子」。
 * 两阶段用文字小标 + LEVEL UP 细分隔区分；价格与「含第一阶段全部」用文字说明承载，而非容器。
 * 数据直接映射 PROJECT_TIMELINE / STAGE2_MILESTONES，无平行坐标。
 * ──────────────────────────────────────────────────────────────────────── */

// 贯穿全程的时间轴渐变：第一阶段七彩 → 第二阶段职业深色系。
const TIMELINE_GRADIENT = `linear-gradient(to bottom, ${THEMES.cognition.hex}, ${THEMES.frontend.hex}, ${THEMES.backend.hex}, ${THEMES.agent.hex}, ${THEMES.launch.hex}, ${THEMES.mobile.hex}, ${THEMES.mindset.hex}, ${STAGE2_THEMES.advance.hex}, ${STAGE2_THEMES.enterprise.hex}, ${STAGE2_THEMES.career.hex})`

/* 一个里程碑：圆点 + 课时号 + 标题 + 收获一行（纯文字，无盒子）。 */
function Milestone({
  theme,
  badge,
  title,
  gain,
  prominent = false,
}: {
  theme: Theme
  badge: string
  title: string
  gain: string
  prominent?: boolean
}) {
  return (
    <li className="relative pl-9 sm:pl-11">
      {/* 圆点（坐在时间轴线上） */}
      <span
        aria-hidden
        className="absolute left-[1px] top-[3px] h-3 w-3 rounded-full sm:left-[2px] sm:h-3.5 sm:w-3.5"
        style={{
          background: `radial-gradient(circle, ${theme.gradientFrom} 0%, ${theme.gradientTo} 78%)`,
          boxShadow: `0 0 12px ${theme.hex}aa, 0 0 0 4px rgba(5,5,7,0.85)`,
        }}
      />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <span
          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em] sm:text-[11px]"
          style={{ color: theme.hex }}
        >
          {badge}
        </span>
        <h4 className="font-serif-zh text-[15px] font-semibold leading-tight text-ink sm:text-[17px]">
          {title}
        </h4>
      </div>
      <p
        className={
          prominent
            ? 'mt-1.5 text-[13px] leading-[1.6] text-ink-soft sm:text-[13.5px]'
            : 'mt-1.5 text-[12.5px] leading-[1.6] text-muted sm:text-[13px]'
        }
      >
        <span
          className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.1em]"
          style={{ color: `rgba(${theme.rgb}, 0.85)` }}
        >
          收获
        </span>
        {gain}
      </p>
    </li>
  )
}

/* 阶段小标：纯文字（名称 + 价格 + 覆盖 + 适合），用一个颜色短竖条点睛,不套盒子。 */
function StageLabel({
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
    <div className="relative pl-9 sm:pl-11">
      {/* 颜色短竖条（与时间轴线对齐位置略宽,作为阶段起点标识） */}
      <span
        aria-hidden
        className="absolute left-[-1px] top-1 h-[18px] w-[5px] rounded-full sm:left-0 sm:h-5"
        style={{ background: accent, boxShadow: `0 0 12px ${accent}aa` }}
      />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-serif-zh text-[17px] font-bold text-ink sm:text-[19px]">{name}</span>
        {originalPrice && (
          <span className="font-mono text-[11.5px] text-muted line-through tabular">原价 {originalPrice}</span>
        )}
        <span
          className="font-serif-zh text-[20px] font-bold tabular sm:text-[22px]"
          style={{ color: full ? '#FECDD3' : accent, textShadow: `0 0 16px ${accent}55` }}
        >
          {price}
        </span>
        {includes && (
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.04em]" style={{ color: accent }}>
            · {includes}
          </span>
        )}
        <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">{coverage}</span>
      </div>
      <p className="mt-1 text-[12px] leading-[1.6] text-muted sm:text-[12.5px]">适合：{fit}</p>
    </div>
  )
}

export function JourneyMap() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative">
        {/* 贯穿全程的时间轴竖线 */}
        <span
          aria-hidden
          className="absolute left-[7px] top-[6px] bottom-[6px] w-[2px] rounded-full sm:left-[8px]"
          style={{ background: TIMELINE_GRADIENT, opacity: 0.85 }}
        />

        <div className="flex flex-col gap-7 sm:gap-8">
          {/* 起点 */}
          <Reveal>
            <div className="relative pl-9 sm:pl-11">
              <span
                aria-hidden
                className="absolute left-[3px] top-[6px] h-2 w-2 rounded-full sm:left-1"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">起点</span>
              <span className="ml-2.5 text-[12.5px] text-ink-soft sm:text-[13px]">零基础，不用看一行代码</span>
            </div>
          </Reveal>

          {/* 第一阶段小标 */}
          <Reveal delay={0.03}>
            <StageLabel
              accent={THEMES.cognition.hex}
              name={AUDIENCES.stage1.name}
              price={STAGE1_PRICE.now}
              originalPrice={STAGE1_PRICE.original}
              coverage={AUDIENCES.stage1.coverage}
              fit={AUDIENCES.stage1.fit}
            />
          </Reveal>

          {/* 第一阶段里程碑 */}
          <ol className="flex flex-col gap-7 sm:gap-8">
            {PROJECT_TIMELINE.map((node, i) => {
              const t = THEMES[node.theme]
              return (
                <Reveal key={`s1-${node.chapter}`} delay={Math.min(i, 5) * 0.03}>
                  <Milestone theme={t} badge={node.chapter} title={node.milestone} gain={node.detail} />
                </Reveal>
              )
            })}
          </ol>

          {/* LEVEL UP 细分隔 */}
          <Reveal delay={0.03}>
            <div className="relative flex items-center gap-3 pl-9 sm:pl-11">
              <span
                aria-hidden
                className="absolute left-[3px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 animate-pulse rounded-full sm:left-1"
                style={{ background: STAGE2_THEMES.advance.hex, boxShadow: `0 0 10px ${STAGE2_THEMES.advance.hex}` }}
              />
              <span
                className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] sm:text-[11px]"
                style={{ color: STAGE2_THEMES.advance.hex }}
              >
                LEVEL UP · 进阶解锁
              </span>
              <span
                aria-hidden
                className="h-px flex-1"
                style={{ background: `linear-gradient(to right, ${STAGE2_THEMES.advance.hex}66, transparent)` }}
              />
            </div>
          </Reveal>

          {/* 第二阶段小标 */}
          <Reveal delay={0.03}>
            <StageLabel
              accent={STAGE2_THEMES.advance.hex}
              name={AUDIENCES.stage2.name}
              price={STAGE2_PRICE.now}
              includes={STAGE2_PRICE.includes}
              coverage={AUDIENCES.stage2.coverage}
              fit={AUDIENCES.stage2.fit}
              full
            />
          </Reveal>

          {/* 第二阶段里程碑 */}
          <ol className="flex flex-col gap-7 sm:gap-8">
            {STAGE2_MILESTONES.map((m, i) => {
              const t = STAGE2_THEMES[m.theme]
              return (
                <Reveal key={`s2-${m.label}`} delay={i * 0.04}>
                  <Milestone theme={t} badge={m.range} title={m.label} gain={m.gain} prominent />
                </Reveal>
              )
            })}
          </ol>

          {/* 终点 */}
          <Reveal delay={0.03}>
            <div className="relative pl-9 sm:pl-11">
              <span
                aria-hidden
                className="absolute left-[3px] top-[6px] h-2 w-2 rounded-full sm:left-1"
                style={{ background: 'rgba(255,255,255,0.5)' }}
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted">终点</span>
              <span className="ml-2.5 text-[12.5px] text-ink-soft sm:text-[13px]">
                独立交付企业级应用 + 拿到 offer 的实战与话术
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
