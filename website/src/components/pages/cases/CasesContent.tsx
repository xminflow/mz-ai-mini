import { LightShell } from '@/components/layout/LightShell'
import { Reveal } from '@/components/motion'
import { SectionHeading } from '@/components/ui'

// 案例内容还在整理，这一页先只放一个明确的占位说明。
// 刻意不放假案例、不放「敬请期待」式空框——写清楚为什么现在没有，比留白更有交代。
export const CasesContent = () => (
  <LightShell>
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
      <Reveal y={18} duration={0.65}>
        <SectionHeading
          as="h1"
          eyebrow="Cases"
          title="案例"
          description="我们正在整理可公开展示的项目案例。多数交付涉及客户的业务数据与内部系统，需要逐个取得授权后才能对外呈现，因此这一页会陆续补齐。"
          align="left"
        />
      </Reveal>

      <Reveal y={14} duration={0.55} delay={0.08}>
        <p className="mt-10 max-w-[34em] text-[15px] leading-[1.9] text-graphite-soft">
          如果您想先了解我们做过什么，可以直接联系我们——我们会挑选与您业务最接近的案例，
          在沟通中向您详细说明具体做法与结果。
        </p>
      </Reveal>
    </section>
  </LightShell>
)
