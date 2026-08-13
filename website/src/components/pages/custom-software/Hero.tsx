'use client'

import { GradientText, Reveal } from '../../motion'
import { EnrollButton } from '../ai-coding-camp/primitives'

export function Hero({ onContact }: { onContact: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-12 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-28 lg:pt-32">
        <Reveal delay={0.08}>
          <h1 className="font-serif-zh mt-7 max-w-4xl text-balance leading-[1.32] tracking-[-0.005em] text-ink sm:mt-8 sm:leading-[1.22] lg:leading-[1.15]">
            <span className="hero-shine mb-2 block text-[18px] font-bold tracking-[0.18em] sm:mb-2.5 sm:text-[22px] lg:text-[26px]">
              软件定制服务
            </span>
            <span className="block text-[26px] font-bold leading-[1.3] sm:text-[38px] lg:text-[48px]">
              我们只做<GradientText className="font-bold">100% 满足你的业务需求</GradientText>的定制服务
            </span>
            <span className="mt-3 block text-[16px] font-semibold leading-[1.6] text-ink-soft sm:mt-4 sm:text-[22px] lg:text-[26px]">
              从需求梳理到上线运营 · 全流程闭环服务 · 最大程度让你省事省心
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:gap-5">
            <EnrollButton label="免费聊聊需求" onClick={onContact} />
            <a
              href="#services"
              className="text-[13px] font-medium text-ink-soft underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-ink sm:text-sm"
            >
              看看我们能做什么 ↓
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
