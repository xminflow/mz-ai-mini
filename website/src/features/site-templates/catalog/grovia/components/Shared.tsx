'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import { Reveal } from '../../../shared/Reveal'
import { asset, type Copy } from '../data'
import { cases, type GroviaCase } from '../cases'
import { GroviaLocale, useCopy } from './Locale'
import { DemoForm } from './Forms'
import '../theme.css'

const MotionLink = motion.create(Link)

export function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
}

export function Button({ href, children, outline = false }: { href?: string; children: ReactNode; outline?: boolean }) {
  const reduced = useReducedMotion()
  const props = { className: `gv-button ${outline ? 'gv-outline' : ''}`, whileHover: reduced ? undefined : { y: -2 }, whileTap: reduced ? undefined : { scale: 0.97 } }
  return href ? <MotionLink {...props} href={href}>{children}{!outline && <span><Arrow /></span>}</MotionLink>
    : <motion.button type="button" {...props}>{children}</motion.button>
}

export function Brand({ light = false }: { light?: boolean }) {
  const { t } = useCopy()
  return <span className="gv-brand"><img src={`/logo/weiyu-logo-web-${light ? 'light' : 'dark'}.svg`} alt="" width="24" height="24" /><span>{t('微域生光', 'Weelume')}</span></span>
}

function LanguageSwitch({ basePath, close }: { basePath: string; close: () => void }) {
  const { locale, t } = useCopy()
  const pathname = usePathname()
  const router = useRouter()
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const target = `${root}${locale === 'zh' ? '/en' : ''}${pathname.slice(basePath.length)}`
  return <Link className="gv-language" href={target} hrefLang={locale === 'zh' ? 'en' : 'zh-CN'} aria-label={t('Switch to English', '切换为中文')} scroll={false} onNavigate={event => {
    // 查询与锚点在点击时读取，避免同页锚点变化导致语言切换丢失位置。
    event.preventDefault()
    close()
    router.push(target + window.location.search + window.location.hash, { scroll: false })
  }}>{locale === 'zh' ? 'EN' : '中'}</Link>
}

function Navigation({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menu = useId()
  const toggle = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const links = [
    { href: `${basePath}/about`, label: t('关于我们', 'About') },
    { href: `${basePath}#feature`, label: t('产品功能', 'Features') },
    { href: `${basePath}#pricing`, label: t('价格方案', 'Pricing') },
    { href: `${basePath}/case-studies`, label: t('客户案例', 'Case studies') },
  ]
  useEffect(() => {
    const escapeMenu = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus() } }
    window.addEventListener('keydown', escapeMenu)
    return () => window.removeEventListener('keydown', escapeMenu)
  }, [open])
  return <nav className="gv-nav gv-glass" aria-label={t('主导航', 'Main navigation')}>
    <div className="gv-nav-bar">
      <Link href={basePath} aria-label={t('微域生光首页', 'Weelume home')} onClick={() => setOpen(false)}><Brand /></Link>
      <div className="gv-nav-links">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}</div>
      <LanguageSwitch basePath={basePath} close={() => setOpen(false)} />
      <div className="gv-nav-cta"><Button href={`${basePath}#contact`}>{t('联系我们', 'Contact us')}</Button></div>
      <button className="gv-menu-toggle" ref={toggle} type="button" aria-expanded={open} aria-controls={menu} aria-label={open ? t('关闭菜单', 'Close menu') : t('打开菜单', 'Open menu')} onClick={() => setOpen(!open)}>{open ? '×' : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}</button>
    </div>
    <AnimatePresence initial={false}>{open && <motion.div className="gv-mobile-menu" id={menu} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>
      {[...links, { href: `${basePath}#contact`, label: t('联系我们', 'Contact us') }].map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
    </motion.div>}</AnimatePresence>
  </nav>
}

export function Title({ children }: { children: string }) {
  return children.split('\n').map((line, index) => <span className="gv-title-line" key={index}>{line.replace(/[，。；：！？]+$/u, '')}</span>)
}

export function Heading({ title, description, left = false, eyebrow }: { title: Copy; description?: Copy; left?: boolean; eyebrow?: Copy }) {
  const { copy } = useCopy()
  return <div className={`gv-heading ${left ? 'gv-heading-left' : ''}`}>{eyebrow && <span className="gv-tag">{copy(eyebrow)}</span>}<h2><Title>{copy(title)}</Title></h2>{description && <p>{copy(description)}</p>}</div>
}

export function Rating() {
  const { t } = useCopy()
  return <div className="gv-rating"><span aria-hidden="true">★★★★★</span><div>{t('评分 4.9 / 5', '4.9 / 5 Rated')}<small>{t('超过 9,200 位客户 · 演示数据', 'Over 9.2k customers · Demo data')}</small></div></div>
}

export function Partners() {
  const { t } = useCopy()
  return <div className="gv-partners" aria-label={t('合作伙伴示例', 'Example partners')}>{['Pluto Inc', 'VitaHealth', 'BoxMedia', 'NovaTech'].map((name, i) => <span key={name}><b aria-hidden="true">{['❯❯', '✚', '◈', '◒'][i]}</b>{name}</span>)}</div>
}

export function CaseCards({ basePath, items = cases }: { basePath: string; items?: GroviaCase[] }) {
  const { copy, t } = useCopy()
  const reduced = useReducedMotion()
  return <div className="gv-case-grid">{items.map((item, index) => <Reveal key={item.slug} delay={(index % 2) * 0.08}><MotionLink className="gv-case-card gv-glass" href={`${basePath}/case-studies/${item.slug}`} initial="rest" animate="rest" whileHover={reduced ? undefined : 'hover'}>
    <div className="gv-case-image"><motion.img variants={{ rest: { scale: 1 }, hover: { scale: 1.025 } }} transition={{ duration: reduced ? 0 : 0.4 }} src={asset(item.cover)} alt={t(`${item.name} 案例封面`, `${item.name} case study cover`)} width="960" height="540" loading="lazy" /><span>{item.year}</span><b>{item.name}</b></div>
    <div className="gv-case-copy"><h3>{item.name}<Arrow /></h3><p>{copy(item.summary)}</p><span className="gv-text-link">{t('阅读案例', 'Read story')} ↗</span></div>
  </MotionLink></Reveal>)}</div>
}

export function ContactSection() {
  const { t } = useCopy()
  return <section className="gv-band gv-contact" id="contact"><div className="gv-container gv-contact-grid">
    <Reveal><span className="gv-tag">{t('从一次对话开始', 'LET’S TALK')}</span><Heading left title={['开启你的\n下一段增长', 'Start your journey']} description={['一起将想法变成清晰的行动，建立更好的协作方式。', 'Let’s start building something great together.']} /><div className="gv-contact-details"><span>{t('项目咨询与合作', 'Project inquiries & collaboration')}</span><span>{t('通过演示表单了解协作方式', 'Explore collaboration with the demo form')}</span></div><Rating /></Reveal>
    <Reveal><DemoForm /></Reveal>
  </div></section>
}

function Footer({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <footer className="gv-footer gv-container"><div className="gv-footer-top">
    <div><Link href={basePath}><Brand /></Link><h2>{t('让团队成长更有方向', 'Give your team a clearer path to growth')}</h2><h3>{t('订阅我们的最新动态', 'Sign up for our newsletter')}</h3><DemoForm newsletter /></div>
    <div className="gv-footer-links"><span>{t('页面导航', 'Pages')}</span>{[[basePath, t('首页', 'Home')], [`${basePath}/about`, t('关于我们', 'About')], [`${basePath}#pricing`, t('价格方案', 'Pricing')], [`${basePath}/case-studies`, t('客户案例', 'Case studies')], [`${basePath}/design-system`, t('设计系统', 'Design system')]].map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</div>
  </div><div className="gv-footer-bottom"><Link href="/templates">{t('微域生光：模板市场', 'Weelume: Template marketplace')}</Link><span>{t('案例、评价、团队与套餐均为模板演示内容', 'Cases, reviews, team and plans are demonstration content')}</span><TemplateFiling /></div></footer>
}

export function SiteShell({ basePath, locale = 'zh', children }: SiteTemplatePageProps & { children: ReactNode }) {
  return <GroviaLocale.Provider value={locale}><MotionConfig reducedMotion="user"><div className="gv-site">
    <a className="gv-skip" href="#gv-main">{locale === 'zh' ? '跳转到正文' : 'Skip to content'}</a><Navigation basePath={basePath} /><main id="gv-main">{children}</main><Footer basePath={basePath} />
    <Link href="/templates" className="gv-market-logo" aria-label={locale === 'zh' ? '微域生光 · 模板首页' : 'Weelume · Template home'}><img src="/logo/weiyu-logo-web-light.svg" alt="" width="24" height="24" /><span>{locale === 'zh' ? '微域生光' : 'Weelume'}</span></Link>
  </div></MotionConfig></GroviaLocale.Provider>
}

