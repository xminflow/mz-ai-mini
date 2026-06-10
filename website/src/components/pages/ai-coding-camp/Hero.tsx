'use client'

import type { ReactNode } from 'react'

import { GradientText, Reveal } from '../../motion'
import { HeroAuroraLayers, FloatingOrbs, ShimmerHeading } from './primitives'
import { THEMES } from './data'

/* 首屏核心宣传：八条核心主旨，图标特性网格呈现。文案逐字按用户原话——
 * 拆成 pre+em+post 只为把关键词汇放大高亮，三段拼接后与原句完全一致，未改一字。 */
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
const PROMISE_THEMES = [
  THEMES.cognition, THEMES.frontend, THEMES.backend, THEMES.agent, THEMES.launch, THEMES.mobile, THEMES.mindset,
]
// 八条各自的线性图标（与主旨语义对应）。
const ICONS: ReactNode[] = [
  // 1 精品课程 / CTO 亲授 —— 学位帽
  <><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" /></>,
  // 2 全生命周期闭环 —— 循环
  <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
  // 3 学习效果负责 / 跟踪进度 —— 靶心
  <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.6" /></>,
  // 4 市面最好 —— 奖杯
  <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1.5A3 3 0 0 0 7 10M17 6h3v1.5A3 3 0 0 1 17 10" /></>,
  // 5 核心竞争力 —— 闪电
  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  // 6 悟透 / 思维骨架 —— 灯泡
  <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.8 10.6c.5.4.8 1 .8 1.6v.8h6v-.8c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" /></>,
  // 7 持续进化社区 —— 用户群
  <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="8" r="3.4" /><path d="M22 21v-2a4 4 0 0 0-3-3.8M16 4.2a4 4 0 0 1 0 7.6" /></>,
  // 8 求职面试 —— 公文包
  <><rect x="2.5" y="7.5" width="19" height="12" rx="2" /><path d="M16 7.5V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1.5" /></>,
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

        {/* 八条核心主旨 · 图标特性网格（关键词放大；文案逐字按用户原话） */}
        <Reveal delay={0.26}>
          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-x-10 gap-y-7 text-left sm:mt-14 sm:grid-cols-2 sm:gap-x-12">
            {PROMISES.map((p, i) => {
              const t = PROMISE_THEMES[i % PROMISE_THEMES.length]
              return (
                <Reveal key={i} delay={0.06 + i * 0.05}>
                  <div className="group flex items-start gap-4">
                    {/* 发光图标 */}
                    <span
                      className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, rgba(${t.rgb}, 0.24), rgba(${t.rgb}, 0.07))`,
                        boxShadow: `0 0 20px -4px ${t.hex}, inset 0 0 0 1px rgba(${t.rgb}, 0.22)`,
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[22px] w-[22px]"
                        fill="none"
                        stroke={t.hex}
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ filter: `drop-shadow(0 0 5px ${t.hex}88)` }}
                      >
                        {ICONS[i]}
                      </svg>
                    </span>
                    {/* 整句（关键词放大霓虹高亮） */}
                    <p className="pt-0.5 text-[14.5px] font-medium leading-[1.75] text-ink-soft sm:text-[15px]">
                      {p.pre}
                      <span
                        className="font-bold"
                        style={{ color: t.hex, textShadow: `0 0 16px ${t.hex}77`, fontSize: '1.32em' }}
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
