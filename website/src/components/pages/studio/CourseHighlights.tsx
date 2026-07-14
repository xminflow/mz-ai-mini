'use client'

import { GradientText, Reveal } from '../../motion'
import { THEMES } from '../ai-coding-camp/data'
import type { ThemeKey } from '../ai-coding-camp/data'

type Highlight = { title: string; body: string; theme: ThemeKey }

const HIGHLIGHTS: Highlight[] = [
  {
    title: '十多年经验浓缩',
    body: '总结浓缩十多年研发经验，补全你最需要的能力，不做无关的知识堆砌。',
    theme: 'frontend',
  },
  {
    title: '精准匹配岗位要求',
    body: '分析上百家公司的招聘要求，让你精准匹配岗位要求，把每一分学习都花在刀刃上。',
    theme: 'agent',
  },
  {
    title: '背调背书保障',
    body: '我们直接给你背书，应对入职背调，让你学到的项目经历真实有效。',
    theme: 'launch',
  },
  {
    title: '真实订单分成',
    body: '我们也在不断接入真实企业订单，优秀毕业成员有机会直接参与接单、参与分钱。',
    theme: 'mindset',
  },
]

export function CourseHighlights() {
  return (
    <div className="flex h-full flex-col gap-5">
      <Reveal>
        <div className="flex flex-col gap-2">
          <h2 className="font-serif-zh text-[20px] font-bold leading-[1.4] text-ink sm:text-[24px]">
            这套课程的核心价值，
            <GradientText className="font-bold">为企业招聘而设计</GradientText>
          </h2>
          <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
            只为帮你以最快的速度找到好工作，体现你的职业价值。
          </p>
        </div>
      </Reveal>

      <div className="flex flex-1 flex-col gap-4">
        {HIGHLIGHTS.map((h, i) => {
          const t = THEMES[h.theme]
          return (
            <Reveal key={h.title} delay={0.06 + i * 0.05}>
              <div
                className="h-full rounded-md p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 sm:p-6"
                style={{
                  background: 'linear-gradient(150deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 100%)',
                  boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
                }}
              >
                <span
                  aria-hidden
                  className="block h-[3px] w-9 rounded-full transition-all duration-300"
                  style={{ background: `linear-gradient(90deg, ${t.gradientFrom}, ${t.gradientTo})` }}
                />
                <h3 className="mt-4 font-serif-zh text-[17px] font-bold leading-tight sm:text-[19px]">
                  <GradientText>{h.title}</GradientText>
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.8] text-ink-soft sm:text-[13px]">{h.body}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
