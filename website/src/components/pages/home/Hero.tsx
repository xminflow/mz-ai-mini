'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { useContact } from '@/components/layout/contact-context'
import { RevealText } from '@/components/motion/RevealText'
import { Button, ButtonLink } from '@/components/ui'

const LINE_ONE = '把软件定制'
const LINE_TWO = '做成您的专属贵宾服务'

/** 逐字间隔。45ms × 15 字，整句约 675ms，快到不让人等、慢到看得出是一个个浮现的 */
const CHAR_STEP_MS = 45
/** 第二行接着第一行播，中间留半拍，让「把软件定制」这个短句先站住 */
const LINE_TWO_DELAY = LINE_ONE.length * CHAR_STEP_MS + 120
/** 标题跑完之后副标题才进场，否则两段动效叠在一起谁也看不清 */
const SUB_DELAY_MS = LINE_TWO_DELAY + LINE_TWO.length * CHAR_STEP_MS + 80

export const Hero = () => {
  const { openContact } = useContact()
  const reduce = useReducedMotion()
  const [tailShown, setTailShown] = useState(false)

  // 副标题与按钮整块进场，不逐字：它们的信息量比标题大，逐字反而拖慢阅读。
  //
  // reduce 时直接不起定时器，也不在这里补一次 setState——tailStyle 在 reduce 下返回
  // undefined，元素本来就没有 opacity 样式、默认可见。多写那一次同步 setState 只会
  // 触发一轮无谓的级联渲染。
  useEffect(() => {
    if (reduce) return
    const timer = setTimeout(() => setTailShown(true), SUB_DELAY_MS)
    return () => clearTimeout(timer)
  }, [reduce])

  const tailStyle = (extraDelay: number) =>
    reduce
      ? undefined
      : {
          opacity: tailShown ? 1 : 0,
          transform: tailShown ? 'none' : 'translateY(12px)',
          transition: [
            `opacity 620ms ease-out ${extraDelay}ms`,
            `transform 620ms cubic-bezier(0.22, 1, 0.26, 1) ${extraDelay}ms`,
          ].join(', '),
        }

  return (
    <section id="top" className="relative">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-32">
        {/* 字号上限比旧标语低一档：这句每行 10 个字，5.5rem 时一行要 860px 以上，会顶到容器边。
            字间距与行高按普惠体重调过：普惠体字面比微软雅黑饱满，沿用雅黑时代的
            -0.02em 字距会让笔画挤在一起。 */}
        <h1 className="font-hero text-[clamp(2.2rem,5.2vw,4.75rem)] font-bold leading-[1.16] tracking-[-0.01em] text-graphite">
          <RevealText as="div" text={LINE_ONE} stepMs={CHAR_STEP_MS} />
          <RevealText
            as="div"
            text={LINE_TWO}
            stepMs={CHAR_STEP_MS}
            delayMs={LINE_TWO_DELAY}
          />
        </h1>

        {/* 桌面端用显式换行按语义断句，避免中文在词中间断行 */}
        <p
          className="font-hero-sub mt-7 max-w-[34ch] text-[16px] leading-[1.85] text-graphite-soft sm:max-w-none sm:text-[17px]"
          style={tailStyle(0)}
        >
          从需求梳理、产品设计，到开发交付与后期运营，全流程 1 对 1 深度服务
          <br className="hidden sm:block" />
          我们将 7×24 小时为您提供专属的服务人员，以服务行业的标准来做软件定制生意
        </p>

        <div
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
          style={tailStyle(90)}
        >
          <Button onClick={openContact}>联系我们</Button>
          <ButtonLink href="#services" variant="secondary">
            看服务
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
