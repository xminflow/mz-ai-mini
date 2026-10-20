'use client'

import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui'
import { useContact } from '@/components/layout/contact-context'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'

export const HomeContact = () => {
  const { copy } = useSiteLocale()
  const { openContact } = useContact()
  return (
    <section className="home-contact" aria-labelledby="home-contact-title">
      <Reveal className="home-contact-panel">
        <span className="home-eyebrow">{copy.contactEyebrow}</span>
        <h2 id="home-contact-title">{copy.contactTitle}</h2>
        <p>{copy.contactDescription}</p>
        <Button onClick={openContact}>{copy.contact}</Button>
        <span className="home-contact-availability"><i aria-hidden="true" />{copy.availability}</span>
      </Reveal>
    </section>
  )
}
