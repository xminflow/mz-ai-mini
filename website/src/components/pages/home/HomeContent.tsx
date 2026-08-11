'use client'

import { useState } from 'react'

import { BottomCta } from './BottomCta'
import { CapabilityBar } from './CapabilityBar'
import { ContactModal } from './ContactModal'
import { EngagementModes } from './EngagementModes'
import { Hero } from './Hero'
import { HomeFooter } from './HomeFooter'
import { HomeNav } from './HomeNav'
import { IndustryStrip } from './IndustryStrip'
import { Process } from './Process'
import { ServiceGrid } from './ServiceGrid'
import { TechStack } from './TechStack'
import { WhyUs } from './WhyUs'

export const HomeContent = () => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-paper text-graphite">
      <HomeNav onContact={openContact} />
      <main className="flex-1">
        <Hero onContact={openContact} />
        <CapabilityBar />
        <ServiceGrid />
        <IndustryStrip onContact={openContact} />
        <WhyUs />
        <EngagementModes />
        <Process />
        <TechStack />
        <BottomCta onContact={openContact} />
      </main>
      <HomeFooter />
      <ContactModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
