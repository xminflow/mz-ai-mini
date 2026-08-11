import { LightShell } from '@/components/layout/LightShell'
import { Reveal } from '@/components/motion'
import { SectionHeading } from '@/components/ui'

import { ServiceFlow } from './ServiceFlow'

export const ServiceModelsContent = () => (
  <LightShell>
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
      {/* 标题整块淡入上移。刻意不做逐词 stagger——那是最容易一眼看出是套模板的手法 */}
      <Reveal y={18} duration={0.65}>
        <SectionHeading
          as="h1"
          eyebrow="How we work"
          title="七步走完，每步都有你能拿到的东西"
          description="点任意一步，展开这一步的细节。"
          align="left"
          className="mb-12 sm:mb-14"
        />
      </Reveal>
      <ServiceFlow />
    </section>
  </LightShell>
)
