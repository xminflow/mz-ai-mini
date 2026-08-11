'use client'

import { useState } from 'react'

import { CapabilityBar } from './CapabilityBar'
import { ContactModal } from './ContactModal'
import { Hero } from './Hero'
import { HomeFooter } from './HomeFooter'
import { HomeNav } from './HomeNav'

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
      </main>
      <HomeFooter />
      <ContactModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
