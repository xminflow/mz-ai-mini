'use client'

import { useContact } from '@/components/layout/contact-context'
import { Button, ButtonLink } from '@/components/ui'

export const Hero = () => {
  const { openContact } = useContact()

  return (
    <section id="top" className="relative">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-32">
        {/* 字号上限比旧标语低一档：这句每行 10 个字，5.5rem 时一行要 860px 以上，会顶到容器边 */}
        <h1 className="text-[clamp(2.2rem,5.2vw,4.75rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-graphite">
          把软件定制
          <br />
          做成您的专属贵宾服务
        </h1>
        {/* 桌面端用显式换行按语义断句，避免中文在词中间断行 */}
        <p className="mt-7 max-w-[34ch] text-[16px] leading-[1.8] text-graphite-soft sm:max-w-none sm:text-[17px]">
          从需求梳理、产品设计，到开发交付与后期运营，全流程 1 对 1 深度服务
          <br className="hidden sm:block" />
          我们将 7×24 小时为您提供专属的服务人员，以服务行业的标准来做软件定制生意
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={openContact}>联系我们</Button>
          <ButtonLink href="#services" variant="secondary">
            看服务
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
