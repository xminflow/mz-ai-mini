'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { photo } from '../data'
import { Heading, useCopy } from './Shared'
import { useNuboReducedMotion } from './Motion'

const slides = [
  ['3VIglJhUObdpgghYlY45YqNKE', '灵巧的日常', 'Everyday dexterity'],
  ['0MwqppnigTZLAWvCcVydrTCXZCw', '清洁整理', 'A tidier home'],
  ['xKSEviCkA9W32EBCPeuGUDGWbwY', '备餐帮手', 'A hand in the kitchen'],
  ['AkfqDuVkjktmahEsR0a0ezx9rlE', '家人陪伴', 'A little more company'],
  ['AezYeaUC8DVKEnzisFc9DHQOM', '照顾宠物', 'Everyday care'],
  ['qd4gM5krrDfPSJ05Fg8CYcXz304', '照看家中', 'Looking after home'],
  ['Nr2QL5KepfsOCmTOEveYMqp7lo', '随手帮忙', 'A helping hand'],
] as const

export function Capabilities() {
  const { t } = useCopy()
  const reduced = useNuboReducedMotion()
  const viewport = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const visible = useInView(viewport, { amount: 0.2 })
  const [active, setActive] = useState(0)
  const [position, setPosition] = useState(1)
  const [instant, setInstant] = useState(false)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const autoplay = visible && !reduced && !paused && !hovered
  const select = (index: number) => {
    setActive((index + slides.length) % slides.length)
    setPosition(index + 1)
  }
  // 首尾各保留一张相邻画面，跨边界后无动画复位，避免最后一张倒穿整条画廊。
  const loopSlides = [slides[slides.length - 1], ...slides, slides[0]]
  useEffect(() => {
    if (!instant) return
    let second = 0
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setInstant(false)) })
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second) }
  }, [instant])
  useEffect(() => {
    if (!autoplay) return
    const timer = window.setInterval(() => { setActive(index => (index + 1) % slides.length); setPosition(index => index + 1) }, 5000)
    return () => window.clearInterval(timer)
  }, [autoplay])
  useEffect(() => {
    if (autoplay && active === 0) video.current?.play().catch(() => { if (process.env.NODE_ENV === 'development') console.debug('[nubo] capability video autoplay blocked') })
    else video.current?.pause()
  }, [autoplay, active])
  return <section className="nb-section nb-capabilities-section" id="feature" aria-roledescription={t('轮播图', 'carousel')} aria-label={t('安静的能力', 'Capabilities')}>
    <div className="nb-container"><Heading eyebrow={['安静的能力', 'Capabilities']} title={['把小事做好\n让生活自然发生', 'What Weelume\ndoes quietly']} description={['一个下午认识房间，一周学会生活习惯。理解你家的整洁标准，慢慢融入日常。', 'Learns your rooms in an afternoon and your routines within a week. A home has its own rhythm. It learns yours.']} /></div>
    <div className="nb-carousel-viewport" ref={viewport} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setPaused(true)}>
      <div className="nb-carousel-anchor">
        <motion.div className="nb-capabilities" initial={false} animate={{ x: `${-position * 100}%` }} transition={{ duration: reduced || instant ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => { if (position === 0 || position === slides.length + 1) { setInstant(true); setPosition(position === 0 ? slides.length : 1) } }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.08} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 40 || Math.abs(info.velocity.x) > 350) { select(active + (info.offset.x < 0 ? 1 : -1)); setPaused(true) } }}>
          {loopSlides.map(([image, zh, en], index) => <motion.div className="nb-capability" key={`${image}-${index}`} aria-roledescription={t('幻灯片', 'slide')} aria-label={`${((index - 1 + slides.length) % slides.length) + 1} / ${slides.length} · ${t(zh, en)}`} aria-hidden={active !== index - 1}>
            {index === 1 ? <video ref={video} muted loop playsInline preload="none" poster={photo(image)} aria-label={t(zh, en)} onError={() => console.error('[nubo] capability video load failed')}><source src="/templates/nubo/capability.mp4" type="video/mp4" /></video> : <img src={photo(image)} alt={t(zh, en)} loading="lazy" draggable={false} />}
          </motion.div>)}
        </motion.div>
      </div>
    </div>
    <div className="nb-carousel-controls">
      {!reduced && <button type="button" className="nb-carousel-play" aria-label={paused ? t('播放轮播', 'Play slideshow') : t('暂停轮播', 'Pause slideshow')} aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '▷' : 'Ⅱ'}</button>}
      <div className="nb-carousel-dots" role="group" aria-label={t('选择能力画面', 'Select capability')}>
        {slides.map(([, zh, en], index) => <button type="button" key={zh} aria-label={t(`查看${zh}`, `Show ${en}`)} aria-current={active === index ? 'true' : undefined} onClick={() => { select(index); setPaused(true) }} />)}
      </div>
    </div>
  </section>
}
