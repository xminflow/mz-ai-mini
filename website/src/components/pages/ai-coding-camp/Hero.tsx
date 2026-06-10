'use client'

import { GradientText, Reveal } from '../../motion'
import { HeroAuroraLayers, FloatingOrbs, ShimmerHeading } from './primitives'
import { THEMES } from './data'

/* 首屏核心宣传：八条核心主旨。文案逐字按用户原话——拆成 pre+em+post 只为把关键词汇放大高亮，
 * 三段拼接后与原句完全一致，未改一字。 */
const PROMISES: { pre: string; em: string; post: string }[] = [
  { pre: '我们专注于做好每一节精品课程，', em: 'CTO亲自带你从零一步步实操', post: '' },
  { pre: '从开发到上线，我们教你真正做完', em: '软件全生命周期闭环', post: '' },
  { pre: '我们需要', em: '对你的学习效果负责', post: '，持续跟踪你的掌握进度' },
  { pre: '我们是', em: '市面上最好的', post: '，真正的全程AI思维驱动的AI编程实战课' },
  { pre: '我们知道未来必定是全民AI编程，并针对性地挖掘出', em: '你未来的核心竞争力', post: '' },
  { pre: '我们提炼了软件工程中最核心的思维骨架，只需要这一套课程即可', em: '悟透软件应用开发领域', post: '' },
  { pre: '我们知道知识需要不断更新，于是为你打造了', em: '持续进化的AI社区', post: '' },
  { pre: '我们知道你的真实求职压力，于是为你安排了', em: '最实用的求职面试专题', post: '' },
]
// 各取一个主题色（沿用第一阶段七彩，超出循环复用）。
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

        {/* 八条核心主旨 · 首屏核心宣传：无边框卡片（柔光底，无边框），关键词汇放大 */}
        <Reveal delay={0.26}>
          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:mt-14 sm:grid-cols-2 sm:gap-5">
            {PROMISES.map((p, i) => {
              const t = PROMISE_THEMES[i % PROMISE_THEMES.length]
              return (
                <Reveal key={i} delay={0.06 + i * 0.06}>
                  <div
                    className="group relative h-full overflow-hidden rounded-[20px] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:p-6"
                    style={{
                      background: `linear-gradient(135deg, rgba(${t.rgb}, 0.13) 0%, rgba(13,13,18,0.45) 72%)`,
                      boxShadow: `0 0 34px -16px ${t.hex}, 0 10px 30px -18px rgba(0,0,0,0.6)`,
                    }}
                  >
                    {/* 角落主题色光晕 */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
                      style={{ background: `radial-gradient(circle, ${t.hex}66 0%, transparent 65%)` }}
                    />
                    <p className="relative text-[14.5px] font-medium leading-[1.85] text-ink-soft sm:text-[15px]">
                      {p.pre}
                      <span
                        className="font-bold"
                        style={{ color: t.hex, textShadow: `0 0 18px ${t.hex}77`, fontSize: '1.4em' }}
                      >
                        {p.em}
                      </span>
                      {p.post}
                    </p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
