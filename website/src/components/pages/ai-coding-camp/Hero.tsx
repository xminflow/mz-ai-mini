'use client'

import { GradientText, Reveal } from '../../motion'
import { HeroAuroraLayers, FloatingOrbs, ShimmerHeading } from './primitives'
import { THEMES } from './data'

/* 首屏核心宣传：七条承诺。文案逐字按用户原话——拆成 pre+em+post 只为给关键短语上霓虹高亮，
 * 三段拼接后与原句完全一致，未改一字。 */
const PROMISES: { pre: string; em: string; post: string }[] = [
  { pre: '我们专注于做好每一节精品课程，', em: 'CTO亲自带你从零一步步实操', post: '' },
  { pre: '我们需要', em: '对你的学习效果负责', post: '，持续跟踪你的掌握进度' },
  { pre: '我们是', em: '市面上最好的', post: '，真正的全程AI思维驱动的AI编程实战课' },
  { pre: '我们知道未来必定是全民AI编程，并针对性地挖掘出', em: '你未来的核心竞争力', post: '' },
  { pre: '我们确定软件应用开发领域你', em: '只需要这一套课程即可搞定', post: '' },
  { pre: '我们知道知识需要不断更新，于是为你打造了', em: '持续进化的AI社区', post: '' },
  { pre: '我们知道你的真实求职压力，于是为你安排了', em: '最实用的求职面试专题', post: '' },
]
// 七条各取一个主题色（沿用第一阶段七彩）。
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
                迎接<GradientText className="font-semibold">全民 AI 编程</GradientText>时代
              </span>
            </p>
          </div>
        </Reveal>

        {/* 七大承诺 · 首屏核心宣传：霓虹编号宣言（炫酷、突出；文案逐字按用户原话） */}
        <Reveal delay={0.26}>
          <div className="mt-12 w-full max-w-4xl sm:mt-16">
            <div className="grid grid-cols-1 gap-x-10 gap-y-6 text-left sm:grid-cols-2 sm:gap-x-12 sm:gap-y-7">
              {PROMISES.map((p, i) => {
                const t = PROMISE_THEMES[i]
                return (
                  <Reveal key={i} delay={0.1 + i * 0.07}>
                    <div className="group relative flex items-start gap-3.5 sm:gap-4">
                      {/* 大号发光序号 */}
                      <span
                        aria-hidden
                        className="relative font-serif-zh text-[30px] font-black leading-none tabular transition-transform duration-300 group-hover:scale-110 sm:text-[40px]"
                        style={{ color: t.hex, textShadow: `0 0 22px ${t.hex}aa, 0 0 4px ${t.hex}` }}
                      >
                        {String(i + 1).padStart(2, '0')}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -inset-3 -z-10 rounded-full opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-90"
                          style={{ background: `radial-gradient(circle, ${t.hex}66 0%, transparent 70%)` }}
                        />
                      </span>
                      {/* 整句（关键短语霓虹高亮） */}
                      <p className="pt-0.5 text-[14.5px] font-medium leading-[1.65] text-ink sm:text-[16.5px] sm:leading-[1.6]">
                        {p.pre}
                        <span className="font-bold" style={{ color: t.hex, textShadow: `0 0 16px ${t.hex}66` }}>
                          {p.em}
                        </span>
                        {p.post}
                      </p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
