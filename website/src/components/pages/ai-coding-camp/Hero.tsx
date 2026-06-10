'use client'

import { GradientText, Reveal } from '../../motion'
import { HeroAuroraLayers, FloatingOrbs, ShimmerHeading } from './primitives'
import { THEMES } from './data'

// 首屏核心宣传：七条承诺（文案按用户原话，逐字不改）。
const PROMISES: string[] = [
  '我们专注于做好每一节精品课程，CTO亲自带你从零一步步实操',
  '我们需要对你的学习效果负责，持续跟踪你的掌握进度',
  '我们是市面上最好的，真正的全程AI思维驱动的AI编程实战课',
  '我们知道未来必定是全民AI编程，并针对性地挖掘出你未来的核心竞争力',
  '我们确定软件应用开发领域你只需要这一套课程即可搞定',
  '我们知道知识需要不断更新，于是为你打造了持续进化的AI社区',
  '我们知道你的真实求职压力，于是为你安排了最实用的求职面试专题',
]
// 七条各取一个主题色作勾选标记（沿用第一阶段七彩）。
const PROMISE_THEMES = [
  THEMES.cognition, THEMES.frontend, THEMES.backend, THEMES.agent, THEMES.launch, THEMES.mobile, THEMES.mindset,
]

export function Hero() {
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
                <GradientText className="font-semibold">AI 编程专家</GradientText>
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

        {/* 七大承诺 · 首屏核心宣传（文案逐字按用户原话；首屏主角，放大突出） */}
        <Reveal delay={0.28}>
          <div className="mt-11 w-full max-w-4xl sm:mt-14">
            <div className="flex justify-center">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft sm:text-[12px]">
                · 我们的承诺 · COMMITMENT ·
              </span>
            </div>
            <div className="mt-7 grid grid-cols-1 gap-x-12 gap-y-5 text-left sm:mt-9 sm:grid-cols-2 sm:gap-y-6">
              {PROMISES.map((text, i) => {
                const t = PROMISE_THEMES[i]
                return (
                  <div key={i} className="flex items-start gap-3.5">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                        boxShadow: `0 0 14px -2px ${t.hex}bb`,
                      }}
                    >
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="#0a0a0c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 8.5l3 3 6-6.5" />
                      </svg>
                    </span>
                    <p className="text-[15px] font-medium leading-[1.65] text-ink sm:text-[16.5px]">{text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
