'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { asset } from '../data'
import { useLuneraLocale } from './Locale'

export function Partners({ contact = false }: { contact?: boolean }) {
  const { locale, t } = useLuneraLocale()
  const reduced = useReducedMotion()
  const logos = contact ? ['contact-partner-1.png', 'contact-partner-2.png', 'contact-partner-3.png', 'contact-partner-4.png', 'contact-partner-5.png'] : Array.from({ length: 5 }, (_, i) => `partner-${i + 1}.png`)
  return <div className="ln-partners" aria-label={t("合作品牌")}><motion.div className="ln-partner-track" initial={false} whileInView={{ x: reduced ? '0%' : ['0%', '-50%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>{[0, 1].map(copy => <div className="ln-partner-group" key={copy} aria-hidden={copy === 1}>{logos.map((file, index) => <img src={asset(file)} alt={copy === 0 ? locale === 'zh' ? `合作品牌 ${index + 1}` : `Partner ${index + 1}` : ''} key={file} width="150" height="38" loading="lazy" />)}</div>)}</motion.div></div>
}

