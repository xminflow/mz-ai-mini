'use client'

import Link from 'next/link'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { ConicornLocale, useCopy } from './Locale'
import '../theme.css'

const MotionLink = motion.create(Link)

export function Button({ href, children, light = false, type = 'button' }: { href?: string; children: ReactNode; light?: boolean; type?: 'button' | 'submit' }) {
  const reduced = useReducedMotion()
  const props = { className: `cc-button ${light ? 'cc-button-light' : ''}`, whileHover: reduced ? undefined : { y: -2 }, whileTap: reduced ? undefined : { scale: .98 } }
  return href ? <MotionLink {...props} href={href}>{children}<span aria-hidden="true">↗</span></MotionLink> : <motion.button type={type} {...props}>{children}<span aria-hidden="true">↗</span></motion.button>
}

function Navigation({ basePath }: { basePath: string }) {
  const { t, locale } = useCopy()
  const pathname = usePathname() ?? basePath
  const [open, setOpen] = useState(false)
  useEffect(() => { const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [])
  const links = [{ href: `${basePath}#value`, label: t('价值', 'Value') }, { href: `${basePath}#capabilities`, label: t('能力', 'Capabilities') }, { href: `${basePath}#process`, label: t('流程', 'Process') }, { href: `${basePath}#pricing`, label: t('价格', 'Pricing') }, { href: `${basePath}/case-studies`, label: t('案例', 'Case Studies') }, { href: `${basePath}/contact`, label: t('联系', 'Contact') }, { href: `${basePath}/privacy-policy`, label: t('隐私', 'Privacy') }, { href: `${basePath}/terms-of-service`, label: t('条款', 'Terms') }]
  const zhBase = locale === 'en' && basePath.endsWith('/en') ? basePath.slice(0, -3) : basePath
  const tail = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : ''
  const language = locale === 'en' ? `${zhBase}${tail}` : `${zhBase}/en${tail}`
  return <nav className="cc-nav"><Link href={basePath} className="cc-logo" aria-label="Conicorn home"><span>✦</span></Link><button className="cc-menu" type="button" aria-expanded={open} aria-label={open ? t('关闭菜单', 'Close menu') : t('打开菜单', 'Open menu')} onClick={() => setOpen(!open)}><i />{open ? t('关闭', 'Close') : t('菜单', 'Menu')}</button><Link className="cc-template-cta" href={`${basePath}#pricing`}>{t('获取模板', 'Get this Template')}</Link><Link className="cc-lang-switch" href={language} aria-label={locale === 'en' ? 'Switch to Chinese' : '切换到英文'}>{locale === 'en' ? '中文' : 'EN'}</Link><AnimatePresence>{open && <motion.div className="cc-mobile-menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>{links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link href={`${basePath}#contact`} onClick={() => setOpen(false)}>{t('联系我们', 'Work with Us')}</Link></motion.div>}</AnimatePresence></nav>
}

export function Shell({ basePath, locale = 'en', children }: SiteTemplatePageProps & { children: ReactNode }) {
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  const [submitted, setSubmitted] = useState(false)
  return <ConicornLocale.Provider value={locale}><MotionConfig reducedMotion="user"><div className="cc-site" data-locale={locale}><Navigation basePath={basePath} /><main>{children}</main><footer className="cc-footer" id="contact"><div className="cc-footer-grid"><div><p className="cc-kicker">{t('你的竞争对手正在自动化。', 'YOUR COMPETITORS ARE AUTOMATING.')}</p><h2>{t('你呢？', 'Are you?')}</h2><p>{t('停止浪费时间在手工流程上，开始构建一个自动运行的业务。', 'Stop wasting time on manual processes. Start building a self-running business.')}</p></div><form className="cc-form" onSubmit={event => { event.preventDefault(); setSubmitted(true) }}><input required name="name" autoComplete="name" placeholder={t('姓名', 'Name')} /><input required type="email" name="email" autoComplete="email" placeholder={t('邮箱', 'Email')} /><textarea required name="message" placeholder={t('告诉我们你的目标', 'Tell us about your goals')} rows={4} /><Button type="submit">{t('发送请求', 'Send Your Request!')}</Button>{submitted && <p className="cc-form-status" role="status">{t('感谢你的留言。演示表单尚未发送。', 'Thanks — your request is ready. This demo does not send data.')}</p>}</form></div><div className="cc-footer-links"><Link href="https://linkedin.com">LinkedIn</Link><Link href="https://instagram.com">Instagram</Link><Link href="https://facebook.com">Facebook</Link><Link href="https://x.com">X</Link><Link href={`${basePath}/case-studies`}>{t('案例', 'Case Studies')}</Link><Link href={`${basePath}/contact`}>{t('联系', 'Contact')}</Link><Link href={`${basePath}/terms-of-service`}>{t('条款', 'Terms')}</Link><Link href={`${basePath}/privacy-policy`}>{t('隐私', 'Privacy')}</Link></div><div className="cc-footer-bottom"><span>{t('© 2026 Conicorn · Weelume 模板', '© 2026 Conicorn · Weelume template')}</span><Link href="/templates">{t('模板市场', 'Template marketplace')}</Link></div></footer><Link href="/templates" className="cc-market-logo" aria-label={locale === 'zh' ? '微域生光 · 模板首页' : 'Weelume · Template home'}><img src="/logo/weiyu-logo-web-light.svg" alt="" width={24} height={24} /><span>{locale === 'zh' ? '微域生光' : 'Weelume'}</span></Link></div></MotionConfig></ConicornLocale.Provider>
}
