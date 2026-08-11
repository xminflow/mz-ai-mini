import { SectionHeading } from '@/components/ui'

import { ADVANTAGES } from '../custom-software/data'

// 刻意用「左标题 + 右正文」的宽行式加细分隔线，不套卡片：
// 5 条正文都是长句，堆成卡片会变成一片视觉噪音。
export const WhyUs = () => (
  <section id="why-us" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading eyebrow="Why us" title="为什么把系统交给我们" align="left" />
    <div className="mt-12 flex flex-col">
      {ADVANTAGES.map((advantage) => (
        <div
          key={advantage.title}
          className="grid grid-cols-1 gap-3 border-t border-rule py-7 md:grid-cols-[minmax(0,16em)_minmax(0,1fr)] md:gap-10"
        >
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-graphite">
            {advantage.title}
          </h3>
          {/* 行宽上限：不设的话在 1440 下单行会拉到 90 字左右，远超中文阅读舒适区 */}
          <p className="max-w-[42em] text-[15px] leading-[1.85] text-graphite-soft">
            {advantage.body}
          </p>
        </div>
      ))}
    </div>
  </section>
)
