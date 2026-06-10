'use client'

import { GradientText, Reveal } from '../../motion'
import { HeroAuroraLayers, FloatingOrbs, ShimmerHeading } from './primitives'
import { STAGE1_PRICE, STAGE2_PRICE, STAGE2_THEMES } from './data'

// Hero 概览数字：2 阶段 / 24 课 / 9+ 件可展示产出(第一阶段 4 件交付 + 第二阶段 5 项收获)
const OVERVIEW_STATS: { value: string; label: string }[] = [
  { value: '2', label: '阶段' },
  { value: '24', label: '课' },
  { value: '9+', label: '件可展示产出' },
]

export function Hero() {
  // 第二阶段强调色(钢蓝),作为「职业进阶」锚点的专业感主色
  const advance = STAGE2_THEMES.advance

  return (
    <section className="relative overflow-hidden">
      <HeroAuroraLayers />
      <FloatingOrbs />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:pt-32">
        <Reveal delay={0.08}>
          <h1 className="font-serif-zh mt-7 max-w-4xl text-balance text-[30px] font-bold leading-[1.32] tracking-[-0.005em] sm:mt-8 sm:text-[46px] sm:leading-[1.22] lg:text-[58px] lg:leading-[1.15]">
            <ShimmerHeading>AI 编程实战训练营</ShimmerHeading>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-6 max-w-3xl sm:mt-7">
            <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
              <span className="block">
                零基础入门 +{' '}
                <GradientText className="font-semibold">职业开发者进阶</GradientText>
                {' '}· 两门课,各得其所
              </span>
              <span className="mt-2 block text-[14px] sm:mt-3 sm:text-[16px] lg:text-[17px]">
                <span
                  className="font-semibold"
                  style={{ color: '#67E8F9', textShadow: '0 0 14px rgba(103,232,249,0.45)' }}
                >
                  零基础也不用担心学不会
                </span>
                <span className="text-ink-soft"> · 有基础者直通企业级 AI 工程 </span>
                <span className="font-semibold text-ink">按需选择,从想法到上线</span>
              </span>
            </p>
          </div>
        </Reveal>

        {/* 概览数字行：2 阶段 · 24 课 · 9+ 件可展示产出 */}
        <Reveal delay={0.22}>
          <div className="mt-6 flex items-center gap-3 font-mono text-ink-soft sm:mt-7 sm:gap-4">
            {OVERVIEW_STATS.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3 sm:gap-4">
                {i > 0 && <span aria-hidden className="text-muted">·</span>}
                <span className="flex items-baseline gap-1.5">
                  <span
                    className="text-[16px] font-bold tabular sm:text-[18px]"
                    style={{ color: '#C4B5FD', textShadow: '0 0 14px rgba(196,181,253,0.45)' }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[12px] tracking-[0.04em] sm:text-[13px]">{stat.label}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 双课程价格锚点：零基础 ¥1999 / 职业进阶 ¥3999(含第一阶段),点击跳转对应阶段 */}
        <Reveal delay={0.3}>
          <div className="mt-9 grid w-full max-w-2xl grid-cols-1 gap-3.5 sm:mt-11 sm:grid-cols-2 sm:gap-4">
            {/* 锚点 1：零基础 AI 编程 → #stage-one */}
            <a
              href="#stage-one"
              className="group relative flex flex-col gap-2 rounded-[20px] border p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:p-5"
              style={{
                borderColor: 'rgba(251,113,133,0.5)',
                background:
                  'linear-gradient(135deg, rgba(251,113,133,0.16), rgba(251,191,36,0.10) 70%)',
                boxShadow: 'inset 0 0 0 1px rgba(251,113,133,0.08), 0 0 28px -10px rgba(251,113,133,0.5)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-canvas sm:text-[10.5px]"
                  style={{
                    background: 'linear-gradient(135deg, #FB7185, #E11D48)',
                    boxShadow: '0 4px 14px -2px rgba(251,113,133,0.6)',
                  }}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  首批限定
                </span>
                <span
                  className="font-mono text-[10.5px] font-medium tracking-[0.04em] text-muted transition-colors group-hover:text-ink-soft sm:text-[11px]"
                >
                  ↓ 看课程
                </span>
              </div>
              <span className="font-serif-zh text-[16px] font-semibold text-ink sm:text-[17px]">
                第一阶段 · 零基础 AI 编程
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-serif-zh text-[26px] font-bold tabular sm:text-[30px]"
                  style={{ color: '#FECDD3', textShadow: '0 0 18px rgba(251,113,133,0.6)' }}
                >
                  {STAGE1_PRICE.now}
                </span>
                <span className="font-mono text-[11.5px] text-muted line-through tabular sm:text-[12.5px]">
                  原价 {STAGE1_PRICE.original}
                </span>
              </div>
              <span className="text-[12px] leading-[1.6] text-ink-soft sm:text-[12.5px]">
                适合零基础 · 想用 AI 做出自己的应用
              </span>
            </a>

            {/* 锚点 2：职业开发者进阶 → #stage-two(含第一阶段全部) */}
            <a
              href="#stage-two"
              className="group relative flex flex-col gap-2 rounded-[20px] border p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:p-5"
              style={{
                borderColor: `rgba(${advance.rgb}, 0.5)`,
                background: `linear-gradient(135deg, rgba(${advance.rgb}, 0.18), rgba(${STAGE2_THEMES.career.rgb}, 0.10) 70%)`,
                boxShadow: `inset 0 0 0 1px rgba(${advance.rgb}, 0.10), 0 0 28px -10px rgba(${advance.rgb}, 0.5)`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-canvas sm:text-[10.5px]"
                  style={{
                    background: `linear-gradient(135deg, ${advance.gradientFrom}, ${advance.gradientTo})`,
                    boxShadow: `0 4px 14px -2px rgba(${advance.rgb}, 0.6)`,
                  }}
                >
                  职业进阶
                </span>
                <span className="font-mono text-[10.5px] font-medium tracking-[0.04em] text-muted transition-colors group-hover:text-ink-soft sm:text-[11px]">
                  ↓ 看课程
                </span>
              </div>
              <span className="font-serif-zh text-[16px] font-semibold text-ink sm:text-[17px]">
                第二阶段 · 职业开发者进阶
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-serif-zh text-[26px] font-bold tabular sm:text-[30px]"
                  style={{ color: advance.gradientFrom, textShadow: `0 0 18px rgba(${advance.rgb}, 0.55)` }}
                >
                  {STAGE2_PRICE.now}
                </span>
                <span
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold sm:text-[11px]"
                  style={{
                    border: `1px solid rgba(${advance.rgb}, 0.42)`,
                    background: `rgba(${advance.rgb}, 0.12)`,
                    color: advance.gradientFrom,
                  }}
                >
                  {STAGE2_PRICE.includes}
                </span>
              </div>
              <span className="text-[12px] leading-[1.6] text-ink-soft sm:text-[12.5px]">
                适合有基础者 · 进阶企业级 AI 工程与求职
              </span>
            </a>
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
  )
}
