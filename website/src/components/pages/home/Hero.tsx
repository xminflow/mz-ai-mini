'use client'

import Link from 'next/link'
import { useId } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { RevealText } from '@/components/motion/RevealText'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { useContact } from '@/components/layout/contact-context'
import { Button, ButtonLink } from '@/components/ui'

type HeroPreview = { name: string; src: string; href: string }

export const Hero = ({ previews }: { previews: HeroPreview[] }) => {
  const markerMaskId = useId()
  const { copy } = useSiteLocale()
  const { openContact } = useContact()
  const revealStep = 45
  const revealStart = 200
  const leadDelay = revealStart + [...copy.heroOne].length * revealStep
  const emphasisDelay = leadDelay + [...copy.heroTwoLead].length * revealStep

  return (
    <section id="top" className="home-hero">
      <div className="home-hero-grid">
        <Reveal className="home-hero-copy" y={16}>
          <span className="home-eyebrow"><i aria-hidden="true" />{copy.heroEyebrow}</span>
          <h1>
            <RevealText key={copy.heroOne} text={copy.heroOne} mode="fade" stepMs={revealStep} delayMs={revealStart} />
            <span>
              <RevealText key={copy.heroTwoLead} text={copy.heroTwoLead} mode="fade" stepMs={revealStep} delayMs={leadDelay} />
              <span className="home-hero-emphasis">
                <RevealText key={copy.heroTwoEmphasis} text={copy.heroTwoEmphasis} mode="fade" stepMs={revealStep} delayMs={emphasisDelay} />
                <svg viewBox="0 0 260 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                  <defs>
                    <mask id={markerMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="100">
                      <path className="home-marker-draw" style={{ animationDelay: `${emphasisDelay}ms` }} d="M237 20C207 5 123 6 66 18C25 27 5 46 19 64C38 86 104 91 164 80C207 73 245 57 245 40C245 26 221 18 183 17" pathLength="1" />
                    </mask>
                  </defs>
                  <g mask={`url(#${markerMaskId})`}>
                    <path className="home-marker-paint" d="M237.09 19.82L233.93 18.30L230.41 16.91L226.55 15.68L222.38 14.57L217.94 13.53L213.23 12.53L208.28 11.62L203.08 10.82L197.66 10.18L192.04 9.66L186.24 9.23L180.29 8.85L174.19 8.52L167.96 8.28L161.63 8.17L155.20 8.20L148.70 8.33L142.15 8.52L135.56 8.74L128.95 9.03L122.34 9.42L115.75 9.95L109.19 10.59L102.69 11.30L96.26 12.05L89.91 12.83L83.66 13.69L77.55 14.67L71.58 15.77L65.78 16.96L61.71 17.87L57.78 18.80L53.98 19.76L50.33 20.81L46.84 21.97L43.52 23.22L40.35 24.51L37.31 25.81L34.41 27.12L31.67 28.49L29.11 29.94L26.74 31.48L24.55 33.08L22.51 34.69L20.61 36.32L18.86 37.97L17.31 39.70L15.98 41.51L14.88 43.38L13.96 45.29L13.22 47.23L12.64 49.20L12.29 51.23L12.22 53.29L12.44 55.36L12.91 57.42L13.59 59.48L14.46 61.54L15.55 63.60L16.90 65.63L19.21 68.10L21.75 70.29L24.56 72.34L27.61 74.29L30.91 76.15L34.45 77.89L38.25 79.47L42.29 80.87L46.54 82.15L50.98 83.34L55.60 84.47L60.40 85.50L65.37 86.40L70.51 87.13L75.79 87.72L81.21 88.21L86.74 88.63L92.39 88.98L98.14 89.23L103.98 89.32L109.89 89.25L115.87 89.06L121.91 88.80L127.99 88.47L134.11 88.06L140.25 87.52L146.39 86.82L152.52 85.98L158.64 85.04L164.74 84.03L169.00 83.28L173.29 82.46L177.53 81.53L181.70 80.51L185.81 79.42L189.85 78.31L193.82 77.20L197.72 76.06L201.52 74.86L205.21 73.56L208.77 72.18L212.23 70.77L215.58 69.37L218.82 67.97L221.93 66.53L224.89 65.02L227.67 63.42L230.28 61.78L232.75 60.14L235.08 58.51L237.25 56.86L239.22 55.15L240.96 53.37L242.48 51.53L243.79 49.67L244.92 47.80L245.84 45.91L246.52 43.97L246.88 41.99L246.91 40.00L246.71 38.41L246.36 36.88L245.88 35.40L245.25 33.96L244.44 32.61L243.44 31.34L242.27 30.18L240.97 29.08L239.59 28.01L238.09 26.95L236.46 25.95L234.68 25.04L232.76 24.23L230.72 23.48L228.57 22.74L226.32 22.00L223.95 21.29L221.46 20.64L218.84 20.09L216.10 19.62L213.25 19.19L210.31 18.75L207.26 18.32L204.10 17.93L200.83 17.62L197.46 17.42L193.99 17.27L190.42 17.13L186.76 16.99L183.00 16.87L183.00 17.13L186.75 17.26L190.40 17.45L193.95 17.75L197.40 18.12L200.74 18.53L203.98 18.94L207.12 19.35L210.14 19.80L213.05 20.34L215.83 20.97L218.48 21.65L221.02 22.35L223.45 23.03L225.76 23.74L227.93 24.51L229.95 25.37L231.82 26.29L233.56 27.24L235.16 28.18L236.65 29.12L237.99 30.09L239.16 31.12L240.15 32.21L240.96 33.31L241.65 34.40L242.24 35.48L242.70 36.56L243.01 37.68L243.13 38.83L243.09 40.00L242.87 41.40L242.49 42.80L241.94 44.21L241.19 45.66L240.18 47.09L238.93 48.50L237.46 49.90L235.82 51.32L234.02 52.77L232.03 54.24L229.85 55.67L227.46 57.03L224.89 58.35L222.17 59.65L219.32 60.97L216.33 62.29L213.21 63.59L209.95 64.81L206.54 65.95L203.01 67.04L199.40 68.12L195.69 69.20L191.90 70.26L188.02 71.26L184.05 72.16L180.01 72.97L175.90 73.74L171.75 74.51L167.57 75.26L163.26 75.97L157.33 77.06L151.35 78.00L145.36 78.82L139.37 79.57L133.38 80.26L127.42 80.87L121.48 81.35L115.58 81.67L109.73 81.85L103.95 81.94L98.25 81.97L92.63 81.93L87.12 81.78L81.72 81.48L76.46 81.03L71.33 80.46L66.36 79.81L61.54 79.11L56.89 78.32L52.42 77.40L48.18 76.32L44.15 75.11L40.35 73.81L36.78 72.45L33.44 71.02L30.35 69.50L27.56 67.85L25.08 66.06L22.90 64.19L21.10 62.37L19.87 60.79L18.84 59.24L18.02 57.68L17.45 56.12L17.10 54.58L16.93 53.05L16.88 51.53L16.97 49.99L17.24 48.43L17.74 46.86L18.47 45.30L19.40 43.74L20.48 42.16L21.72 40.56L23.14 38.93L24.77 37.34L26.63 35.80L28.68 34.31L30.91 32.84L33.29 31.36L35.83 29.88L38.54 28.44L41.44 27.07L44.53 25.80L47.78 24.59L51.17 23.40L54.71 22.21L58.39 21.06L62.23 19.99L66.22 19.04L71.99 17.90L77.92 16.83L83.99 15.78L90.19 14.77L96.49 13.83L102.89 13.02L109.37 12.33L115.90 11.74L122.47 11.19L129.05 10.68L135.63 10.22L142.20 9.88L148.73 9.67L155.21 9.59L161.62 9.58L167.94 9.61L174.15 9.70L180.24 9.87L186.18 10.18L191.96 10.63L197.55 11.19L202.95 11.81L208.14 12.48L213.10 13.23L217.81 14.09L222.24 15.11L226.37 16.27L230.20 17.51L233.72 18.81L236.91 20.18Z" />
                    <path className="home-marker-grain" d="M35 74C74 91 134 89 184 76" />
                  </g>
                </svg>
              </span>
            </span>
          </h1>
          <p className="home-hero-description">{copy.heroDescription}</p>
          <p className="home-hero-service">{copy.heroService}</p>
          <div className="home-hero-actions">
            <Button onClick={openContact}>{copy.contact}</Button>
            <ButtonLink href="#services" variant="secondary">{copy.viewServices}</ButtonLink>
          </div>
        </Reveal>
        <Reveal className="home-hero-visual" delay={0.12} y={20}>
          <div className="home-visual-orbit" aria-hidden="true" />
          {previews.map((preview, index) => (
            <Link key={preview.href} href={preview.href} className={index === 0 ? 'home-preview-main' : 'home-preview-secondary'} aria-label={copy.templateDetails + ': ' + preview.name}>
              <div className="home-preview-chrome"><span aria-hidden="true"><i /><i /><i /></span><small>{preview.name}</small></div>
              <img src={preview.src} alt={preview.name} width={720} height={500} fetchPriority={index === 0 ? 'high' : 'auto'} />
            </Link>
          ))}
          <div className="home-service-note">
            <span className="home-note-icon" aria-hidden="true">✳</span>
            <div><strong>{copy.heroServiceLabel}</strong><p>{copy.heroServiceSteps.join(' · ')}</p></div>
          </div>
          <div className="home-visual-caption"><span>{copy.heroVisualLabel}</span><small>{copy.heroVisualHint}</small></div>
        </Reveal>
      </div>
    </section>
  )
}

