import { LightShell } from '@/components/layout/LightShell'

import { Advantages } from './Advantages'
import { CapabilityBar } from './CapabilityBar'
import { Hero } from './Hero'
import { ServiceFlow } from './ServiceFlow'
import { ServiceTypes } from './ServiceTypes'

export const HomeContent = () => (
  <LightShell glow="home">
    <Hero />
    <CapabilityBar />
    <ServiceTypes />
    <ServiceFlow />
    <Advantages />
  </LightShell>
)
