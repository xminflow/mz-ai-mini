import { LightShell } from '@/components/layout/LightShell'
import { SectionHeading } from '@/components/ui'

import { EngagementModes } from './EngagementModes'
import { Process } from './Process'

export const ServiceModelsContent = () => (
  <LightShell>
    <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pb-14 sm:pt-24">
      <SectionHeading
        as="h1"
        eyebrow="How we work"
        title="两种合作模式，先选一种"
        description="需求清楚不清楚，走的路不一样。选错了双方都难受。"
        align="left"
      />
    </section>
    <EngagementModes />
    <Process />
  </LightShell>
)
