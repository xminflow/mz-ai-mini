'use client'

import Link from 'next/link'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { ViralLocale, useCopy } from './Locale'
import { Mark } from './Artwork'
import '../theme.css'

export function Button({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return <Link className={`vl-button${light ? ' vl-button-light' : ''}`} href={href}>{children}<span aria-hidden="true">↗</span></Link>
}

export function Brand() {
  return <span className="vl-brand"><Mark /><span>微域生光</span></span>
}

function Navigation({ basePath }: { basePath: string }) {
  const { t, locale } = useCopy()
  const pathname = usePathname() ?? basePath
  const [open, setOpen] = useState(false)
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [])
  const links = [
    { href: basePath, label: t('首页', 'Home') },
    { href: `${basePath}/about`, label: t('关于', 'About') },
    { href: `${basePath}/case-studies`, label: t('案例', 'Case Studies') },
    { href: `${basePath}/blog`, label: t('博客', 'Blog') },
  ]
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const tail = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : ''
  const languageHref = `${root}${locale === 'zh' ? '/en' : ''}${tail}`
  return <header className="vl-nav-wrap"><nav className="vl-nav" aria-label={t('主导航', 'Main navigation')}><Link href={basePath} aria-label="微域生光首页"><Brand /></Link><div className="vl-nav-links">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}<Link href={languageHref} className="vl-language" scroll={false}>{locale === 'zh' ? 'EN' : '中'}</Link><Button href={`${basePath}/book-a-call`}>{t('预约通话', 'Book a call')}</Button></div><button type="button" className="vl-menu-toggle" aria-expanded={open} aria-label={open ? t('关闭菜单', 'Close menu') : t('打开菜单', 'Open menu')} onClick={() => setOpen(value => !value)}><span>{open ? '×' : '☰'}</span></button></nav><AnimatePresence>{open && <motion.div className="vl-mobile-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>{links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link href={languageHref} onClick={() => setOpen(false)}>{locale === 'zh' ? 'English' : '中文'}</Link><Button href={`${basePath}/book-a-call`}>{t('预约通话', 'Book a call')}</Button></motion.div>}</AnimatePresence></header>
}

function Footer({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <footer className="vl-footer"><div className="vl-footer-main"><div><Link href={basePath}><Brand /></Link><h2>{t('社交媒体，带来真实增长', 'Social media that drives real results')}</h2><p>{t('为创作者、企业与品牌而做。', 'Built for creators, businesses, and brands.')}</p><div className="vl-socials"><a href="https://x.com" aria-label="X">X</a><a href="https://instagram.com" aria-label="Instagram">◎</a></div></div><div><h3>{t('导航', 'Navigate')}</h3>{['', '/about', '/case-studies', '/blog'].map((path, index) => <Link key={path} href={`${basePath}${path}`}>{[t('首页', 'Home'), t('关于', 'About'), t('案例', 'Case Studies'), t('博客', 'Blog')][index]}</Link>)}</div><div><h3>{t('联系', 'Connect')}</h3><Link href={`${basePath}/book-a-call`}>{t('预约通话', 'Book a call')}</Link><a href="https://instagram.com">Instagram</a><a href="https://linkedin.com">LinkedIn</a><a href="https://twitter.com">Twitter</a></div><div><h3>{t('法律', 'Legal')}</h3><Link href={`${basePath}/privacy-policy`}>{t('隐私政策', 'Privacy Policy')}</Link><Link href={`${basePath}/terms-of-service`}>{t('服务条款', 'Terms of Service')}</Link><a href="mailto:hello@weelume.com">Contact</a><Link href={`${basePath}/404`}>404</Link></div></div><div className="vl-footer-bottom"><span>{t('© 2026 微域生光', '© 2026 微域生光')}</span><Link href="/templates">{t('微域生光：模板市场', '微域生光: template marketplace')}</Link></div></footer>
}

export function Shell({ basePath, locale = 'zh', children }: SiteTemplatePageProps & { children: ReactNode }) {
  const reduced = useReducedMotion()
  return <ViralLocale.Provider value={locale}><MotionConfig reducedMotion="user"><div className="vl-site" data-locale={locale}><Navigation basePath={basePath} /><motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .45 }}>{children}</motion.main><Footer basePath={basePath} /><Link href="/templates" className="vl-market" aria-label={locale === 'zh' ? '微域生光模板市场' : '微域生光 template marketplace'}><img src="/logo/weiyu-logo-web-light.svg" width="24" height="24" alt="" /><span>微域生光</span></Link></div></MotionConfig></ViralLocale.Provider>
}
