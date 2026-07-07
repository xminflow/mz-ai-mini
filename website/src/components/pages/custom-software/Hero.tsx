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
            <span className="block text-[28px] font-bold sm:text-[42px] lg:text-[52px]">
              从<GradientText className="font-bold">想法</GradientText>到
              <GradientText className="font-bold">上线</GradientText>，一个团队全包
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-6 max-w-3xl sm:mt-7">
            <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
              官网、企业系统、小程序、AI 智能体——
              <span className="font-semibold text-ink">AI 原生全栈自研，设计到交互全流程闭环，高效高质量交付</span>
            </p>
          </div>
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
