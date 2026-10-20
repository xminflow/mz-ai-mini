'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import type { SiteTemplatePageProps, TemplateLocale } from '../../../types'
import { PageScrollbar } from '../../../shared/PageScrollbar'
import { asset, t } from '../data'
import { Newsletter } from './forms'
import '../theme.css'
import '../../../shared/page-scrollbar.css'

const navigation = [
  ['about', '关于老宅', 'The house'], ['room', '客房', 'Stay'], ['experiences', '体验', 'Experiences'],
  ['journal', '湖畔日志', 'Journal'], ['contact', '联系', 'Contact'],
] as const

function subscribeLocation(callback: () => void) {
  window.addEventListener('hashchange', callback)
  window.addEventListener('popstate', callback)
  return () => { window.removeEventListener('hashchange', callback); window.removeEventListener('popstate', callback) }
}
const locationSuffix = () => window.location.search + window.location.hash
const serverSuffix = () => ''

function Brand({ locale, light = false }: { locale: TemplateLocale; light?: boolean }) {
  return <span className="nr-brand"><img src={`/logo/weiyu-logo-web-${light ? 'light' : 'dark'}.svg`} width="24" height="24" alt="" /><span>{t(locale, '微域生光', 'Weelume')}</span></span>
}

function Header({ basePath, locale, home }: { basePath: string; locale: TemplateLocale; home: boolean }) {
  const pathname = usePathname() ?? basePath
  const suffix = useSyncExternalStore(subscribeLocation, locationSuffix, serverSuffix)
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const tail = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : ''
  const languageHref = `${root}${locale === 'zh' ? '/en' : ''}${tail}${suffix}`
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>('a')?.focus()
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
      if (event.key !== 'Tab') return
      const items = [toggle.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>('a,button') ?? [])].filter((element): element is HTMLElement => element !== null)
      const first = items[0], last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [open])

  return <header className={`nr-header${home ? ' nr-header-home' : ''}${scrolled || open ? ' is-solid' : ''}`}>
    <div className="nr-nav nr-container">
      <Link href={basePath} aria-label={t(locale, '微域生光首页', 'Weelume home')} onClick={() => setOpen(false)}><Brand locale={locale} light={!home || scrolled || open} /></Link>
      <nav className="nr-desktop-nav" aria-label={t(locale, '主导航', 'Main navigation')}>{navigation.map(([slug, zh, en]) => <Link key={slug} href={`${basePath}/${slug}`} aria-current={pathname.startsWith(`${basePath}/${slug}`) ? 'page' : undefined}>{t(locale, zh, en)}</Link>)}</nav>
      <div className="nr-nav-actions"><Link href={languageHref} className="nr-language" aria-label={t(locale, '切换为英文', 'Switch to Chinese')} scroll={false} onClick={() => setOpen(false)}>{locale === 'zh' ? 'EN' : '中'}</Link><Link className="nr-button nr-reserve" href={`${basePath}/contact`}>{t(locale, '预订旅程', 'Reserve')}</Link><button ref={toggle} type="button" className="nr-menu-toggle" aria-controls="nr-mobile-menu" aria-expanded={open} aria-label={t(locale, open ? '关闭菜单' : '打开菜单', open ? 'Close menu' : 'Open menu')} onClick={() => setOpen(value => !value)}>{open ? '×' : <><span /><span /></>}</button></div>
    </div>
    <AnimatePresence>{open && <motion.nav id="nr-mobile-menu" ref={panel} className="nr-mobile-menu" aria-label={t(locale, '手机导航', 'Mobile navigation')} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .2 }}>{navigation.map(([slug, zh, en], index) => <Link key={slug} href={`${basePath}/${slug}`} onClick={() => setOpen(false)}><small>0{index + 1}</small>{t(locale, zh, en)}</Link>)}<Link href={`${basePath}/#offers`} onClick={() => setOpen(false)}><small>06</small>{t(locale, '入住礼遇', 'Offers')}</Link><p>{t(locale, '科莫湖 · 意大利 · 把时间交给湖水', 'Lake Como · Italy · Time by the water')}</p></motion.nav>}</AnimatePresence>
  </header>
}

export function Shell({ basePath, locale = 'zh', home = false, children }: SiteTemplatePageProps & { home?: boolean; children: ReactNode }) {
  return <MotionConfig reducedMotion="user"><div className="nr-site" data-locale={locale}>
    <a className="nr-skip" href="#nr-main">{t(locale, '跳至主要内容', 'Skip to content')}</a>
    <Header basePath={basePath} locale={locale} home={home} />
    <main id="nr-main">{children}</main>
    <Footer basePath={basePath} locale={locale} />
    <PageScrollbar className="template-scrollbar" controlsId="nr-main" label={t(locale, '页面滚动', 'Page scroll')} autoHide />
    <Link className="nr-home-entry" href="/templates" aria-label={t(locale, '打开微域生光模板市场', 'Open Weelume template marketplace')}><img src="/logo/weiyu-logo-web-light.svg" width="24" height="24" alt="" /><span>{t(locale, '微域生光', 'Weelume')}</span></Link>
  </div></MotionConfig>
}

function Footer({ basePath, locale }: { basePath: string; locale: TemplateLocale }) {
  const columns = [
    { title: t(locale, '入住', 'Stay'), links: [['room', t(locale, '客房与套房', 'Rooms & suites')], ['#offers', t(locale, '入住礼遇', 'Offers')], ['contact', t(locale, '计划旅程', 'Plan your stay')], ['contact#getting-here', t(locale, '如何抵达', 'Getting here')]] },
    { title: t(locale, '体验', 'Experiences'), links: [['experiences#dining', t(locale, '水岸餐饮', 'Lakeside dining')], ['experiences#spa', t(locale, '温石水疗', 'Stone Spa')], ['experiences#lake', t(locale, '湖上旅程', 'On the lake')], ['experiences', t(locale, '全部体验', 'All experiences')]] },
    { title: t(locale, '老宅', 'The house'), links: [['about', t(locale, '关于我们', 'Our story')], ['about#sustainability', t(locale, '可持续生活', 'Sustainability')], ['journal', t(locale, '湖畔日志', 'Journal')], ['contact', t(locale, '联系礼宾', 'Contact')]] },
  ]
  return <footer className="nr-footer">
    <section className="nr-arrive"><img src={asset('vRUGcgEMpqwJ5nYqYOWmikHUEi8.jpg')} alt="" loading="lazy" /><div><p className="nr-eyebrow">{t(locale, '意大利 · 科莫湖', 'Lake Como · Italy')}</p><h2>{t(locale, '静静抵达 慢慢生活', 'Let the lake slow you down')}</h2><Button href={`${basePath}/contact`}>{t(locale, '预订您的假期', 'Plan your escape')}</Button></div></section>
    <div className="nr-container">
      <div className="nr-footer-top"><div><Link href={basePath}><Brand locale={locale} light /></Link><p>{t(locale, '让每一次停留 都有自己的节奏', 'A slower rhythm for every stay')}</p><p className="nr-muted">{t(locale, '湖畔酒店与度假体验模板', 'A lakeside hotel & retreat template')}<br />{t(locale, '地点、价格与行程均为演示内容', 'Locations, rates and itineraries are illustrative')}</p><Link className="nr-text-link" href={`${basePath}/contact`}>{t(locale, '联系礼宾团队', 'Speak with the concierge')}</Link></div><Newsletter locale={locale} /></div>
      <div className="nr-footer-links">{columns.map(column => <div key={column.title}><p className="nr-eyebrow">{column.title}</p>{column.links.map(([slug, label]) => <Link key={slug} href={`${basePath}/${slug}`}>{label}</Link>)}</div>)}<div><p className="nr-eyebrow">{t(locale, '发现更多', 'Explore more')}</p><Link href="/templates">{t(locale, '微域生光：模板市场', 'Weelume: template marketplace')}</Link><Link href={`${basePath}/legal#privacy`}>{t(locale, '隐私政策', 'Privacy')}</Link><Link href={`${basePath}/legal#terms`}>{t(locale, '服务条款', 'Terms')}</Link><Link href={`${basePath}/#hero`}>{t(locale, '回到顶部', 'Back to top')} ↑</Link></div></div>
      <div className="nr-footer-bottom"><span>© {new Date().getFullYear()} {t(locale, '微域生光 · 湖畔隐居', 'Weelume · Lake Retreat')}</span><TemplateFiling /></div>
    </div>
  </footer>
}

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }} transition={{ duration: .65 }}>{children}</motion.div>
}

export function Button({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link className={`nr-button${secondary ? ' nr-button-outline' : ''}`} href={href}>{children}</Link>
}

export function SectionTitle({ label, title, description, action }: { label: string; title: string; description?: string; action?: ReactNode }) {
  return <Reveal className="nr-section-heading"><div><p className="nr-eyebrow">{label}</p><h2>{title}</h2>{description && <p className="nr-muted">{description}</p>}</div>{action}</Reveal>
}

export function PageHero({ label, title, description, image, children, article = false }: { label: string; title: string; description?: string; image?: string; children?: ReactNode; article?: boolean }) {
  return <section id="hero" className={`nr-page-hero${image ? ' has-image' : ''}${article ? ' nr-article-hero' : ''}`}>{image && <img className="nr-hero-image" src={image} alt="" fetchPriority="high" />}<div className="nr-container nr-page-hero-content"><p className="nr-eyebrow">{label}</p><h1>{title}</h1>{description && <p className="nr-lead">{description}</p>}{children}</div></section>
}

