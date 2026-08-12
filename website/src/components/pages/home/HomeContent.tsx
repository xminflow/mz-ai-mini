import { LightShell } from '@/components/layout/LightShell'

import { CapabilityBar } from './CapabilityBar'
import { Hero } from './Hero'
import { ServiceFlow } from './ServiceFlow'
import { ServiceTypes } from './ServiceTypes'

export const HomeContent = () => (
  <LightShell aurora="home">
    <Hero />
    <CapabilityBar />
    <ServiceTypes />
    <ServiceFlow />
  </LightShell>
)
