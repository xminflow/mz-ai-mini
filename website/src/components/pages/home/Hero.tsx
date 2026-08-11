'use client'

import { useContact } from '@/components/layout/contact-context'
import { Button, ButtonLink } from '@/components/ui'

import { WarmGlow } from './WarmGlow'

export const Hero = () => {
  const { openContact } = useContact()

  return (
    // isolate 建立独立层叠上下文，让 WarmGlow 的 -z-10 只压在本 section 内部
    <section id="top" className="relative isolate">
      <WarmGlow />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-32">
        <h1 className="text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-graphite">
          把你的生意
          <br />
          做成一套自己的系统
        </h1>
        {/* 桌面端用显式换行把两句话各占一行，避免中文在「团|队」这类词中间断行 */}
        <p className="mt-7 max-w-[34ch] text-[16px] leading-[1.8] text-graphite-soft sm:max-w-none sm:text-[17px]">
          从聊需求到上线运营，全流程由同一支团队闭环交付。
          <br className="hidden sm:block" />
          官网、企业系统、小程序、AI 智能体，11 类软件定制。
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={openContact}>聊聊需求</Button>
          <ButtonLink href="#services" variant="secondary">
            看服务
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
