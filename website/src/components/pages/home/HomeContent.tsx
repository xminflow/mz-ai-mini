'use client'

import { useState } from 'react'

import { ContactModal } from './ContactModal'
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
        <p className="mx-auto max-w-6xl px-4 py-32 text-center text-graphite-dim sm:px-6">
          骨架占位：Task 3 起替换为真实 section
        </p>
      </main>
      <HomeFooter />
      <ContactModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
