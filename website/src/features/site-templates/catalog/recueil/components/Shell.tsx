'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import type { SiteTemplatePageProps, TemplateLocale } from '../../../types'
import { PageScrollbar } from '../../../shared/PageScrollbar'
import { navigation, t } from '../data'
import '../theme.css'
import '../../../shared/page-scrollbar.css'

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback); window.addEventListener('popstate', callback)
  return () => { window.removeEventListener('hashchange', callback); window.removeEventListener('popstate', callback) }
}
const suffix = () => window.location.search + window.location.hash
const serverSuffix = () => ''

export function Brand({ locale }: { locale: TemplateLocale }) {
  return <span className="rc-brand"><img src="/logo/weiyu-logo-web-light.svg" width="24" height="24" alt="" /><span>{t(locale, '微域生光', 'Weelume')}</span></span>
}

export function Shell({ basePath, locale = 'zh', children, home = false }: SiteTemplatePageProps & { children: ReactNode; home?: boolean }) {
  const pathname = usePathname() ?? basePath
  const query = useSyncExternalStore(subscribe, suffix, serverSuffix)
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const languagePath = `${root}${locale === 'zh' ? '/en' : ''}${pathname.slice(basePath.length)}${query}`
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  useEffect(() => {
    const update = () => setScrolled(scrollY > 30)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => {
    if (!menu) return
    panel.current?.querySelector('a')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(false); toggle.current?.focus() }
      if (e.key !== 'Tab') return
      const items = [toggle.current, ...Array.from(panel.current?.querySelectorAll<HTMLElement>('a') ?? [])].filter((e): e is HTMLElement => e !== null)
      if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1)?.focus() }
      if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0]?.focus() }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [menu])
  return <MotionConfig reducedMotion="user"><div className="rc-site" data-locale={locale}>
    <a className="rc-skip" href="#rc-main">{t(locale, '跳至主要内容', 'Skip to content')}</a>
    <header className={`rc-header${!home || scrolled || menu ? ' is-solid' : ''}`}>
      <div className="rc-container rc-nav">
        <Link href={basePath} onClick={() => setMenu(false)} aria-label={t(locale, '微域生光首页', 'Weelume home')}><Brand locale={locale} /></Link>
        <nav className="rc-desktop-nav" aria-label={t(locale, '主导航', 'Main navigation')}>{navigation.map(([id, zh, en]) => <Link key={id} href={`${basePath}#${id}`}>{t(locale, zh, en)}</Link>)}</nav>
        <div className="rc-nav-actions"><Link className="rc-language" href={languagePath} scroll={false} onClick={() => setMenu(false)} aria-label={t(locale, '切换为英文', 'Switch to Chinese')}>{locale === 'zh' ? 'EN' : '中'}</Link><Link className="rc-button rc-nav-cta" href={`${basePath}#pricing`} onClick={() => setMenu(false)}>{t(locale, '开始订阅', 'Subscribe')}</Link><button className="rc-menu-toggle" ref={toggle} type="button" aria-label={t(locale, menu ? '关闭菜单' : '打开菜单', menu ? 'Close menu' : 'Open menu')} aria-expanded={menu} aria-controls="rc-mobile-menu" onClick={() => setMenu(v => !v)}>{menu ? '×' : <><span /><span /></>}</button></div>
      </div>
      <AnimatePresence>{menu && <motion.nav className="rc-mobile-menu" id="rc-mobile-menu" ref={panel} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .2 }} aria-label={t(locale, '手机导航', 'Mobile navigation')}>{navigation.map(([id, zh, en], i) => <Link key={id} href={`${basePath}#${id}`} onClick={() => setMenu(false)}><small>0{i + 1}</small>{t(locale, zh, en)}</Link>)}<Link href={`${basePath}#contact`} onClick={() => setMenu(false)}>{t(locale, '工坊来信', 'Atelier letters')}</Link></motion.nav>}</AnimatePresence>
    </header>
    <main id="rc-main">{children}</main>
    <footer className="rc-footer rc-container">
      <div className="rc-footer-top"><Link href={basePath}><Brand locale={locale} /></Link><p>{t(locale, '让气味成为生活里温柔的光', 'A little light, carried in a scent.')}</p></div>
      <nav className="rc-footer-nav" aria-label={t(locale, '页脚导航', 'Footer navigation')}>{navigation.map(([id, zh, en]) => <Link key={id} href={`${basePath}#${id}`}>{t(locale, zh, en)}</Link>)}<Link href={`${basePath}#contact`}>{t(locale, '联系与订阅', 'Contact & letters')}</Link></nav>
      <div className="rc-footer-bottom"><span>© {new Date().getFullYear()} {t(locale, '微域生光 · 香氛工坊', 'Weelume · Fragrance atelier')}</span><Link href="/templates">{t(locale, '微域生光：模板市场', 'Weelume: template marketplace')}</Link><Link href={`${basePath}/privacy-policy`}>{t(locale, '隐私说明', 'Privacy')}</Link><Link href={`${basePath}/404`}>404</Link><TemplateFiling /></div>
    </footer>
    <PageScrollbar className="template-scrollbar" controlsId="rc-main" label={t(locale, '页面滚动', 'Page scroll')} autoHide />
    <Link className="rc-home-entry" href="/templates" aria-label={t(locale, '打开微域生光模板市场', 'Open Weelume template marketplace')}><img src="/logo/weiyu-logo-web-light.svg" width="24" height="24" alt="" /><span>{t(locale, '微域生光', 'Weelume')}</span></Link>
  </div></MotionConfig>
}

export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .55 }}>{children}</motion.div>
}

export function Heading({ label, title, description, center = false }: { label?: string; title: ReactNode; description?: string; center?: boolean }) {
  return <Reveal className={`rc-heading${center ? ' is-center' : ''}`}><div>{label && <span className="rc-eyebrow">{label}</span>}<h2>{title}</h2></div>{description && <p>{description}</p>}</Reveal>
}


