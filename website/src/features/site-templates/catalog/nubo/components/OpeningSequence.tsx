'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { photo } from '../data'
import { Button, Title, useCopy } from './Shared'
import { Reveal, useNuboReducedMotion } from './Motion'

const clamp = (value: number) => Math.max(0, Math.min(1, value))

function Hero({ basePath, progress }: { basePath: string; progress: MotionValue<number> }) {
  const { t } = useCopy()
  const reduced = useNuboReducedMotion()
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)
  // 两屏共用同一吸附背景；随滚动从厨房视频过渡到机器人侧脸。
  // 使用同一局部进度计算数值，避免原生 ScrollTimeline 将透明度按整篇文档计算。
  const portraitOpacity = useTransform(() => clamp(progress.get() / 0.5))
  const portraitScale = useTransform(() => 1.12 - clamp(progress.get()) * 0.12)
  const copyOpacity = useTransform(() => 1 - clamp((progress.get() - 0.5) / 0.46))
  const eyebrowY = useTransform(progress, [0, 1], ['0vh', '-20vh'])
  const titleY = useTransform(progress, [0, 1], ['0vh', '-30vh'])
  const bodyY = useTransform(progress, [0, 1], ['0vh', '-40vh'])
  const actionsY = useTransform(progress, [0, 1], ['0vh', '-50vh'])
  const notesY = useTransform(progress, [0, 1], ['0vh', '-60vh'])
  useEffect(() => {
    if (reduced) video.current?.pause()
    else video.current?.play().catch(() => { setPlaying(false); if (process.env.NODE_ENV === 'development') console.debug('[nubo] autoplay blocked; play control remains available') })
  }, [reduced])
  return <section className="nb-hero">
    <video ref={video} muted loop playsInline preload="metadata" poster={photo('jeplaMV5DSqGLRib90xEleN4GE')} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setError(true); console.error('[nubo] hero video load failed') }}>
      <source src="/templates/nubo/home.mp4" type="video/mp4" />
    </video>
    <motion.img className="nb-hero-portrait" src={photo('7zvJcZFEoNeRM7azD4VctYeHHk8')} alt="" aria-hidden="true" style={{ opacity: reduced ? 0 : portraitOpacity, scale: reduced ? 1 : portraitScale }} />
    <div className="nb-hero-shade" />
    <motion.div className="nb-hero-copy" style={{ opacity: reduced ? 1 : copyOpacity }}>
      <Reveal>
        <div className="nb-hero-layer"><motion.span className="nb-eyebrow" style={{ y: reduced ? 0 : eyebrowY }}>
          <i aria-hidden="true">⠿</i>{t('始终温柔，安静相伴', 'Always kind. Mostly invisible.')}
        </motion.span></div>
        <div className="nb-hero-layer"><motion.h1 style={{ y: reduced ? 0 : titleY }}>
          <Title>{t('让家的日常\n多一份从容', 'A quieter kind\nof help at home')}</Title>
        </motion.h1></div>
        <div className="nb-hero-layer"><motion.p style={{ y: reduced ? 0 : bodyY }}>{t('把日复一日的小事交给它\n把珍贵的注意力留给生活', 'The small daily work, taken off your hands.\nWithout asking for your attention.')}</motion.p></div>
        <div className="nb-hero-layer"><motion.div className="nb-actions" style={{ y: reduced ? 0 : actionsY }}>
          <Button href={`${basePath}/waitlist`}>{t('预约体验 · €3,290 起', 'Reserve from €3,290')}</Button>
          <Button light href={`${basePath}#showreel`}>{t('观看产品短片', 'Watch showreel')}</Button>
        </motion.div></div>
      </Reveal>
      <div className="nb-hero-layer"><motion.div className="nb-hero-notes" style={{ y: reduced ? 0 : notesY }}>
        <span>01 / {t('为真实的家而设计', 'DESIGNED FOR REAL HOMES')}</span>
        <span>02 / {t('以安静为默认', 'QUIET BY DEFAULT')}</span>
        <span>03 / {t('你的家，你的数据', 'YOUR HOME. YOUR DATA.')}</span>
      </motion.div></div>
    </motion.div>
    <button type="button" className="nb-video-toggle" disabled={error} aria-label={playing ? t('暂停背景视频', 'Pause background video') : t('播放背景视频', 'Play background video')} onClick={() => { if (playing) video.current?.pause(); else video.current?.play().catch(() => { setError(true); console.error('[nubo] video playback failed') }) }}>{error ? t('影像加载失败', 'Video unavailable') : playing ? 'Ⅱ' : '▷'}</button>
  </section>
}

export function OpeningSequence({ basePath, children }: { basePath: string; children: ReactNode }) {
  const { t, locale } = useCopy()
  const reduced = useNuboReducedMotion()
  const intro = useRef<HTMLElement>(null)
  const [watching, setWatching] = useState(false)
  const reel = useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({ target: intro, offset: ['start end', 'end start'] })
  const { scrollYProgress: introProgress } = useScroll({ target: intro, offset: ['start end', 'start start'] })
  const titleY = useTransform(() => `calc(${scrollYProgress.get()} * var(--tpl-nb-intro-travel))`)
  useEffect(() => {
    if (watching) reel.current?.play().catch(() => console.error('[nubo] showreel playback failed; native play control remains available'))
  }, [watching])
  return <div className="nb-opening">
    <Hero basePath={basePath} progress={introProgress} />
    <section className="nb-intro" id="showreel" ref={intro}>
      <div className="nb-container">
        <motion.h2 className="nb-intro-title" style={{ y: reduced ? 0 : titleY }}>
          <Title>{t('你好，我是微域生光', 'Hello, I’m Weelume.')}</Title>
        </motion.h2>
        {/* 短片首次进入视口时放大回弹，与背景的连续滚动进度分别驱动。 */}
        <motion.div className="nb-showreel" initial={reduced ? false : { y: 120, scale: 1.3 }} whileInView={{ y: 0, scale: 1 }} viewport={{ once: true, amount: 0.08 }} transition={{ type: 'spring', stiffness: 100, damping: 18 }}>
          {watching ? <video ref={reel} controls playsInline preload="metadata" poster={photo('3VIglJhUObdpgghYlY45YqNKE')} aria-label={t('产品演示短片', 'Product showreel')} onError={() => console.error('[nubo] showreel video load failed')}>
            <source src="/templates/nubo/capability.mp4" type="video/mp4" />
            <track kind="captions" src="/templates/nubo/showreel-zh.vtt" srcLang="zh-CN" label="中文" default={locale === 'zh'} />
            <track kind="captions" src="/templates/nubo/showreel.vtt" srcLang="en" label="English" default={locale === 'en'} />
          </video> : <button type="button" onClick={() => setWatching(true)} aria-label={t('播放产品短片', 'Play product showreel')}>
            <img src={photo('3VIglJhUObdpgghYlY45YqNKE')} alt={t('机器人展示手中的积木', 'Robot showing building blocks in its hand')} width="800" height="533" />
            <span className="nb-showreel-play"><b aria-hidden="true">▷</b><span>{t('观看产品短片', 'Watch showreel')}</span></span>
          </button>}
        </motion.div>
      </div>
    </section>
    <div className="nb-home-content">{children}</div>
  </div>
}
