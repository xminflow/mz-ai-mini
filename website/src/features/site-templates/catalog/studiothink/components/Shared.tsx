'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useState, type ReactNode } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import { StudioThinkLocale, useCopy } from './Locale'
import '../theme.css'

const MotionLink = motion.create(Link)

export function Button({ href, children, outline = false }: { href: string; children: ReactNode; outline?: boolean }) {
  const reduced = useReducedMotion()
  return <MotionLink href={href} className={`st-button ${outline ? 'st-button-outline' : ''}`} whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: .98 }}>
    {children}<span aria-hidden="true">↗</span>
  </MotionLink>
}

export function Hand({ children }: { children: ReactNode }) {
  return <span className="st-hand">{children}</span>
}

export function Heading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="st-heading">{eyebrow && <Hand>{eyebrow}</Hand>}<h2>{title.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>{description && <p>{description}</p>}</div>
}

function Navigation({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState('19:23:40')
  const id = useId()
  const links = [['', t('首页', 'Home')], ['/about', t('关于', 'About')], ['/works', t('作品', 'Works')], ['/contact', t('联系', 'Contact')]]
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-GB'))
    updateTime()
    const timer = window.setInterval(updateTime, 1000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])
  return <nav className="st-nav" aria-label={t('主导航', 'Main navigation')}>
    <div className="st-nav-bar">
      <Link href={basePath} className="st-brand" aria-label={t('微域生光首页', 'Weelume home')}><span>{t('微域生光', 'Weelume')}</span><Hand>{t('河内，', 'hanoi,')}</Hand><time>{time}</time></Link>
      <div className="st-nav-links">{links.map(([path, label]) => <Link key={path} href={`${basePath}${path}`}>{label}</Link>)}</div>
      <LanguageSwitch basePath={basePath} close={() => setOpen(false)} />
      <Button href={`${basePath}/contact`}>{t('开始一个项目', 'Start a project')}</Button>
      <button className="st-menu-toggle" type="button" aria-label={open ? t('关闭菜单', 'Close menu') : t('打开菜单', 'Open menu')} aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>{open ? '×' : '☰'}</button>
    </div>
    <AnimatePresence initial={false}>{open && <motion.div id={id} className="st-mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{links.map(([path, label]) => <Link key={path} href={`${basePath}${path}`} onClick={() => setOpen(false)}>{label}<span>↗</span></Link>)}</motion.div>}</AnimatePresence>
  </nav>
}

function LanguageSwitch({ basePath, close }: { basePath: string; close: () => void }) {
  const { locale, t } = useCopy()
  const pathname = usePathname()
  const router = useRouter()
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const target = `${root}${locale === 'zh' ? '/en' : ''}${pathname.slice(basePath.length)}`
  return <Link className="st-language" href={target} hrefLang={locale === 'zh' ? 'en' : 'zh-CN'} aria-label={t('切换为英文', 'Switch to Chinese')} scroll={false} onNavigate={event => {
    event.preventDefault()
    close()
    router.push(target + window.location.search + window.location.hash, { scroll: false })
  }}>{locale === 'zh' ? 'EN' : '中'}</Link>
}

export function StudioForm() {
  const { t } = useCopy()
  const id = useId()
  const [submitted, setSubmitted] = useState(false)
  return <form className="st-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} onChange={() => setSubmitted(false)}>
    <label htmlFor={`${id}-name`}>{t('姓名', 'Name')}<input id={`${id}-name`} name="name" required placeholder={t('你的姓名', 'Your name')} /></label>
    <label htmlFor={`${id}-email`}>{t('邮箱', 'Email')}<input id={`${id}-email`} name="email" type="email" required placeholder="you@example.com" /></label>
    <label htmlFor={`${id}-type`}>{t('项目类型', 'Project Type')}<select id={`${id}-type`} name="type" defaultValue=""><option value="" disabled>{t('请选择…', 'Select…')}</option><option>{t('品牌识别', 'Brand Identity')}</option><option>{t('印刷设计', 'Print Design')}</option><option>{t('编辑设计', 'Editorial Design')}</option><option>{t('定制项目', 'Custom Project')}</option></select></label>
    <label htmlFor={`${id}-details`}>{t('项目详情', 'Project Details')}<textarea id={`${id}-details`} name="details" rows={5} required placeholder={t('简单介绍一下你的项目……', 'Tell us a little about your project…')} /></label>
    <button className="st-button" type="submit">{t('提交', 'Submit')}<span aria-hidden="true">↗</span></button>
    <p className="st-form-note">{t('演示表单：仅做本地校验，不会发送或保存。', 'Demo form: local validation only. Nothing is sent or saved.')}</p>
    <p className="st-form-status" role="status" aria-live="polite">{submitted ? t('感谢，你的留言已准备好发送给微域生光。', 'Thanks — your message is ready for Weelume.') : ''}</p>
  </form>
}

function Footer({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const links = [['', t('首页', 'Home')], ['/about', t('关于', 'About')], ['/works', t('作品', 'Works')], ['/contact', t('联系', 'Contact')]]
  return <footer className="st-footer">
    <div className="st-footer-grid">
      <div><Link href={basePath} className="st-brand st-brand-footer"><span>{t('微域生光', 'Weelume')}</span></Link><p>{t('一个扎根手作的设计实践。', 'A design practice rooted in craft.')}</p><p>{t('越南，河内', 'Hanoi, Vietnam')}</p></div>
      <div><Hand>{t('导航', 'Navigation')}</Hand>{links.map(([path, label]) => <Link key={path} href={`${basePath}${path}`}>{label}</Link>)}</div>
      <div><Hand>{t('联系合作', 'Get in touch')}</Hand><a href="mailto:hello@think.design">hello@think.design</a><a href="tel:+84123456789">(84) 123456789</a></div>
      <div><Hand>{t('社交媒体', 'Socials')}</Hand><a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a><a href="https://behance.net/" target="_blank" rel="noreferrer">Behance</a><a href="https://dribbble.com/" target="_blank" rel="noreferrer">Dribbble</a></div>
    </div>
    <div className="st-footer-bottom"><span>{t('在河内认真制作。', 'Thoughtfully made in Hanoi.')}</span><span>{t('Designed by Huehaus', 'Designed by Huehaus')}</span><span>© 2025 {t('微域生光', 'Weelume')}. {t('版权所有。', 'All rights reserved.')}</span><TemplateFiling /></div>
  </footer>
}

export function SiteShell({ basePath, locale = 'zh', children }: SiteTemplatePageProps & { children: ReactNode }) {
  return <StudioThinkLocale.Provider value={locale}><div className="st-site"><Navigation basePath={basePath} /><main>{children}</main><Footer basePath={basePath} /><Link href="/templates" className="st-market-logo" aria-label={locale === 'zh' ? '微域生光 · 模板首页' : 'Weelume · Template home'}><img src="/logo/weiyu-logo-web-light.svg" alt="" width="24" height="24" /><span>{locale === 'zh' ? '微域生光' : 'Weelume'}</span></Link><Link className="st-skip" href="#main-content">{locale === 'zh' ? '跳转到正文' : 'Skip to content'}</Link></div></StudioThinkLocale.Provider>
}

export function ProjectArrow() {
  return <span className="st-arrow" aria-hidden="true">↗</span>
}


