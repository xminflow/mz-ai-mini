'use client'

import { GradientText, Reveal } from '../../motion'

/* 「为什么选我们」八大核心：短标题 + 完整描述（描述逐字按用户原话，未改一字）。 */
type Pitch = { title: string; desc: string }
const PROMISES: Pitch[] = [
  { title: 'CTO 亲授', desc: '我们专注于做好每一节精品课程，CTO亲自带你从零一步步实操' },
  { title: '软件闭环', desc: '从开发到上线，我们教你真正做完软件全生命周期闭环' },
  { title: '结果负责', desc: '我们需要对你的学习效果负责，持续跟踪你的掌握进度' },
  { title: 'AI 思维', desc: '我们是市面上最好的，真正的全程AI思维驱动的AI编程实战课' },
  { title: '核心竞争力', desc: '我们知道未来必定是全民AI编程，并针对性地挖掘出你未来的核心竞争力' },
  { title: '思维骨架', desc: '我们提炼了软件工程中最核心的思维骨架，只需要这一套课程即可悟透软件应用开发领域' },
  { title: 'AI 社区', desc: '我们知道知识需要不断更新，于是为你打造了持续进化的AI社区' },
  { title: '面试专题', desc: '我们知道你的真实求职压力，于是为你安排了最实用的求职面试专题' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:pt-32">
        <Reveal delay={0.08}>
          <h1 className="font-serif-zh mt-7 max-w-4xl text-balance text-[30px] font-bold leading-[1.32] tracking-[-0.005em] text-ink sm:mt-8 sm:text-[46px] sm:leading-[1.22] lg:text-[58px] lg:leading-[1.15]">
            AI 编程实战训练营
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-6 max-w-3xl sm:mt-7">
            <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
              <span className="block">
                迎接<span className="font-semibold text-ink">全民 AI 编程</span>时代 · <span className="font-semibold text-ink">市面上最好的 AI 编程课堂</span>
              </span>
            </p>
          </div>
        </Reveal>

        {/* 为什么选我们 */}
        <Reveal delay={0.22}>
          <h2 className="font-serif-zh mt-12 text-[24px] font-bold leading-[1.3] text-ink sm:mt-16 sm:text-[30px] lg:text-[34px]">
            为什么选我们？
          </h2>
        </Reveal>

        {/* 八大核心 · 无边框中性玻璃卡片（关键词统一渐变放大；文案逐字按用户原话） */}
        <div className="mt-7 grid w-full max-w-5xl grid-cols-1 gap-4 text-left sm:mt-9 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <Reveal key={i} delay={0.06 + i * 0.05}>
              <div
                className="group h-full rounded-[20px] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 sm:p-6"
                style={{
                  background: 'linear-gradient(150deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 100%)',
                  boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
                }}
              >
                <span
                  aria-hidden
                  className="block h-[3px] w-9 rounded-full transition-all duration-300 group-hover:w-14"
                  style={{ background: 'linear-gradient(90deg, #C4B5FD, #67E8F9)' }}
                />
                <h3 className="mt-4 font-serif-zh text-[19px] font-bold leading-tight sm:text-[21px]">
                  <GradientText>{p.title}</GradientText>
                </h3>
                <p className="mt-2.5 text-[13px] leading-[1.8] text-ink-soft sm:text-[13.5px]">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
