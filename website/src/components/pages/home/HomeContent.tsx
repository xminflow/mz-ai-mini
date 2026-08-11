import { LightShell } from '@/components/layout/LightShell'

import { CapabilityBar } from './CapabilityBar'
import { Hero } from './Hero'
import { IndustryStrip } from './IndustryStrip'
import { ProcessTeaser } from './ProcessTeaser'
import { ServiceGrid } from './ServiceGrid'
import { TechStack } from './TechStack'
import { WhyUs } from './WhyUs'

export const HomeContent = () => (
  <LightShell>
    <Hero />
    <CapabilityBar />
    <ServiceGrid />
    <IndustryStrip />
    <WhyUs />
    <ProcessTeaser />
    <TechStack />
  </LightShell>
)
