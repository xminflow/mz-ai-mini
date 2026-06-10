'use client'

import { GradientText, Reveal } from '../../motion'
import { ShimmerHeading } from './primitives'

/* 首屏核心宣传：八条核心主旨，无边框中性玻璃卡片 + 关键词统一品牌渐变放大。
 * 文案逐字按用户原话——拆成 pre+em+post 只为给关键词上渐变高亮，三段拼接后与原句完全一致，未改一字。 */
type Pitch = { pre: string; em: string; post: string }
const PROMISES: Pitch[] = [
  { pre: '我们专注于做好每一节精品课程，', em: 'CTO亲自带你从零一步步实操', post: '' },
  { pre: '从开发到上线，我们教你真正做完', em: '软件全生命周期闭环', post: '' },
  { pre: '我们需要', em: '对你的学习效果负责', post: '，持续跟踪你的掌握进度' },
  { pre: '我们是', em: '市面上最好的', post: '，真正的全程AI思维驱动的AI编程实战课' },
  { pre: '我们知道未来必定是全民AI编程，并针对性地挖掘出', em: '你未来的核心竞争力', post: '' },
  { pre: '我们提炼了软件工程中最核心的思维骨架，只需要这一套课程即可', em: '悟透软件应用开发领域', post: '' },
  { pre: '我们知道知识需要不断更新，于是为你打造了', em: '持续进化的AI社区', post: '' },
  { pre: '我们知道你的真实求职压力，于是为你安排了', em: '最实用的求职面试专题', post: '' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
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

        {/* 八条核心主旨 · 无边框中性玻璃卡片（关键词统一渐变放大；文案逐字按用户原话） */}
        <div className="mt-11 grid w-full max-w-4xl grid-cols-1 gap-4 text-left sm:mt-14 sm:grid-cols-2 sm:gap-5">
          {PROMISES.map((p, i) => (
            <Reveal key={i} delay={0.06 + i * 0.05}>
              <div
                className="h-full rounded-[20px] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:p-6"
                style={{
                  background: 'linear-gradient(150deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 100%)',
                  boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
                }}
              >
                <p className="text-[14.5px] font-medium leading-[1.9] text-ink-soft sm:text-[15px]">
                  {p.pre}
                  <span className="font-bold" style={{ fontSize: '1.32em' }}>
                    <GradientText className="font-bold">{p.em}</GradientText>
                  </span>
                  {p.post}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
