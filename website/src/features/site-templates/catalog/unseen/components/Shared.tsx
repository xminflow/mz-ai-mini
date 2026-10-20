'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MotionConfig, motion, useAnimationControls } from 'framer-motion'
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import type { SiteTemplatePageProps, TemplateLocale } from '../../../types'
import { navigation, text, type Copy } from '../data'
import { PageScrollbar } from '../../../shared/PageScrollbar'
import { ease, ScenePointer, SmoothWheel, useMotionPreference } from './Motion'
import '../theme.css'

const Locale = createContext<TemplateLocale>('zh')
export function useCopy() {
  const locale = useContext(Locale)
  return { locale, t: (zh: string, en: string) => locale === 'en' ? en : zh, copy: (value: Copy) => text(value, locale) }
}
export function Brand() {
  const { t } = useCopy()
  return <span className="us-brand"><img src="/logo/weiyu-logo-web-dark.svg" width="24" height="24" alt="" /><span>{t('微域生光', 'Weelume')}<sup>®</sup></span></span>
}
export function Button({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link className={`us-button${secondary ? ' us-button-outline' : ''}`} href={href}>{children}<span aria-hidden="true">↘</span></Link>
}
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useMotionPreference()
  return <motion.div className={className} initial={{ opacity: 0, y: 64, clipPath: 'inset(8% 0 0 0)' }} whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }} viewport={{ once: true, amount: .08 }} transition={{ duration: reduced ? 0 : .95, delay: reduced ? 0 : delay, ease }}>{children}</motion.div>
}

function Navigation({ basePath }: { basePath: string }) {
  const { t, copy, locale } = useCopy()
  const pathname = usePathname()
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const reduced = useMotionPreference()
  const controls = useAnimationControls()
  const closing = useRef(false)
  const id = useId()
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const target = `${root}${locale === 'zh' ? '/en' : ''}${pathname.slice(basePath.length)}`
  const close = async () => {
    if (!dialog.current?.open || closing.current) return
    closing.current = true
    await controls.start('closed')
    dialog.current?.close(); setOpen(false); toggle.current?.focus(); closing.current = false
  }
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])
  return <>
    <header className="us-header">
      <Link href={basePath} aria-label={t('微域生光首页', 'Weelume home')}><Brand /></Link>
      <nav className="us-desktop-nav" aria-label={t('主导航', 'Main navigation')}>{navigation.slice(0, 3).map(item => <Link key={item.path} href={`${basePath}${item.path}`} aria-current={pathname === `${basePath}${item.path}` ? 'page' : undefined}>{copy(item.label)}</Link>)}</nav>
      <Link href={target} hrefLang={locale === 'zh' ? 'en' : 'zh-CN'} className="us-language" aria-label={t('切换到英文', 'Switch to Chinese')} scroll={false} onNavigate={event => {
        event.preventDefault(); close(); router.push(target + window.location.search + window.location.hash, { scroll: false })
      }}>{locale === 'zh' ? 'EN' : '中'}</Link>
      <button ref={toggle} className="us-menu-button us-circle" type="button" aria-label={t('打开菜单', 'Open menu')} aria-expanded={open} aria-controls={id} onClick={() => { dialog.current?.showModal(); setOpen(true); void controls.start('open') }}><span aria-hidden="true">••</span></button>
    </header>
    <motion.dialog ref={dialog} id={id} className="us-menu" aria-label={t('全站导航', 'Site navigation')} onCancel={event => { event.preventDefault(); void close() }} onClose={() => setOpen(false)} initial="closed" animate={controls} variants={{ closed: { clipPath: 'inset(0 0 100% 0)', transition: { duration: reduced ? 0 : .38, ease } }, open: { clipPath: 'inset(0 0 0% 0)', transition: { duration: reduced ? 0 : .65, ease, staggerChildren: reduced ? 0 : .075, delayChildren: reduced ? 0 : .12 } } }}>
      <div className="us-menu-top"><Link href={basePath} onClick={close}><Brand /></Link><button type="button" className="us-circle" onClick={close} aria-label={t('关闭菜单', 'Close menu')}>×</button></div>
      <div className="us-menu-inner">
        <nav aria-label={t('全部页面', 'All pages')}>{navigation.map((item, index) => <motion.div key={item.path} variants={{ closed: { y: 48, opacity: 0, transition: { duration: reduced ? 0 : .15 } }, open: { y: 0, opacity: 1, transition: { duration: reduced ? 0 : .65, ease } } }}><Link href={`${basePath}${item.path}`} onClick={close}><small>0{index + 1}</small><span>{copy(item.label)}</span><span aria-hidden="true">↗</span></Link></motion.div>)}</nav>
        <div className="us-menu-aside"><p>{t('品牌 · 数字体验 · 动态影像', 'Brand. Digital. Motion.')}</p><p>{t('让好奇心，带你走得更远', 'Let curiosity take you somewhere new.')}</p><Link href={`${basePath}/contact`} onClick={close}>{t('聊聊你的下一个想法', 'Tell us what’s next')} ↗</Link><Link href={`${basePath}/privacy`} onClick={close}>{t('隐私说明', 'Privacy')}</Link></div>
      </div>
    </motion.dialog>
  </>
}

export function AmbientSound() {
  const { t } = useCopy()
  const audio = useRef<AudioContext | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState(false)
  useEffect(() => () => { void audio.current?.close() }, [])
  const toggle = async () => {
    try {
      if (!audio.current) {
        const context = new AudioContext()
        const gain = context.createGain()
        gain.gain.value = .012
        gain.connect(context.destination)
        // 由浏览器合成舒缓和声，避免引入来源不明的音乐文件；仅在用户点击后启用。
        for (const frequency of [130.81, 196, 261.63]) {
          const oscillator = context.createOscillator()
          oscillator.type = 'sine'; oscillator.frequency.value = frequency
          oscillator.connect(gain); oscillator.start()
        }
        audio.current = context
      }
      if (playing) await audio.current.suspend(); else await audio.current.resume()
      setPlaying(!playing); setError(false)
    } catch (cause) {
      console.error('[unseen] Ambient audio failed', cause)
      setError(true)
    }
  }
  return <div className="us-sound"><button type="button" className={`us-circle ${playing ? 'us-sound-playing' : ''}`} aria-pressed={playing} aria-label={playing ? t('关闭环境音', 'Mute ambient sound') : t('开启环境音', 'Play ambient sound')} onClick={toggle}><span className="us-equalizer" aria-hidden="true"><i /><i /><i /><i /></span></button>{error && <span role="status">{t('音频启动失败，请再次点击重试', 'Audio did not start. Please try again.')}</span>}</div>
}

function Footer({ basePath }: { basePath: string }) {
  const { t, copy } = useCopy()
  return <footer className="us-footer">
    <div className="us-footer-inner">
    <div className="us-footer-heading"><span>{t('下一个意想不到的想法', 'Your next unexpected idea')}</span><Link href={`${basePath}/contact`}>{t('从一句你好开始', 'Starts with hello')}<span aria-hidden="true">↗</span></Link></div>
    <div className="us-footer-grid"><div><Link href={basePath}><Brand /></Link><p>{t('让创意超越预期', 'Creating the unexpected')}</p><p>{t('品牌、数字体验与动态影像工作室', 'An independent brand, digital & motion studio.')}</p></div><nav aria-label={t('页脚导航', 'Footer navigation')}>{navigation.map(item => <Link key={item.path} href={`${basePath}${item.path}`}>{copy(item.label)}</Link>)}</nav><div><span>{t('更多信息', 'Information')}</span><Link href={`${basePath}/privacy`}>{t('隐私说明', 'Privacy')}</Link><Link href={`${basePath}/terms`}>{t('使用条款', 'Terms')}</Link><Link href="/templates">{t('微域生光：模板市场', 'Weelume: template marketplace')} ↗</Link></div></div>
    <div className="us-footer-bottom"><span>© 2026 {t('微域生光', 'Weelume')}</span><span>{t('参考案例与影像归原作者所有 · 内部模板预览', 'Reference work belongs to its creators · Internal template preview')}</span><TemplateFiling /></div>
    </div>
  </footer>
}
export function Shell({ basePath, locale = 'zh', children }: SiteTemplatePageProps & { children: ReactNode }) {
  const pathname = usePathname()
  const reduced = useMotionPreference()
  return <Locale.Provider value={locale}><MotionConfig reducedMotion="user"><div className="us-site"><SmoothWheel /><ScenePointer /><a className="us-skip" href="#main-content">{locale === 'en' ? 'Skip to content' : '跳转至正文'}</a><Navigation basePath={basePath} /><motion.main key={pathname} id="main-content" tabIndex={-1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .65, ease }}>{children}</motion.main><motion.div key={`veil-${pathname}`} className="us-route-veil" aria-hidden="true" initial={{ scaleY: 1 }} animate={{ scaleY: 0 }} transition={{ duration: reduced ? 0 : .7, ease }} /><Footer basePath={basePath} /><PageScrollbar className="us-scrollbar" controlsId="main-content" label={locale === 'en' ? 'Page scroll' : '页面滚动'} autoHide /><Link href="/templates" className="us-market-logo us-circle" aria-label={locale === 'en' ? 'Weelume: template marketplace' : '微域生光：模板市场'}><img src="/logo/weiyu-logo-web-dark.svg" width="24" height="24" alt="" /></Link></div></MotionConfig></Locale.Provider>
}

