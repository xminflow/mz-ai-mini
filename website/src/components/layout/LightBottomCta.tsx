'use client'

import { Button } from '@/components/ui'
import { useContact } from './contact-context'

// 全站唯一的深色块，用来给每个页面收尾做对比。由 LightShell 渲染，页面不需要自己挂。
export const LightBottomCta = () => {
  const { openContact } = useContact()

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="relative overflow-hidden rounded-card bg-graphite px-6 py-16 text-center sm:px-12 sm:py-20">
        {/* 透明度压到 0.15 以下：更高时橙色在近黑底上会晕成一片褐色，观感发脏 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgb(255_60_0/0.14),transparent_58%)]"
        />
        <div className="relative flex flex-col items-center">
          <h2 className="max-w-[20em] text-[clamp(1.6rem,3.2vw,2.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-paper">
            先聊清楚要解决什么问题，再谈怎么做
          </h2>
          <p className="mt-5 max-w-[32em] text-[15px] leading-[1.8] text-paper/70">
            不急着报价。加微信说清你的业务现状，我们给一份看得懂的方案。
          </p>
          {/* 深色底上用 secondary（白底）反而是正确的主按钮 */}
          <Button onClick={openContact} variant="secondary" className="mt-9">
            加微信聊聊
          </Button>
        </div>
      </div>
    </section>
  )
}
