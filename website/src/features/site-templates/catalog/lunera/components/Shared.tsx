'use client'

import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import { asset, type FaqItem, type LuneraArticle } from '../data'
import { Reveal } from './Motion'
import { LocaleContext, useLuneraLocale } from './Locale'
import { getTranslator } from '../messages'
import type { TemplateLocale } from '../../../types'

// 保留 Motion 的交互反馈，同时让站内链接交给 Next 路由，避免重新加载整个文档。
const MotionLink = motion.create(Link)

export type IconName = 'check' | 'arrow' | 'plus' | 'menu' | 'close' | 'lock' | 'trend' | 'music' | 'connect' | 'rocket' | 'cube' | 'growth' | 'mail' | 'phone' | 'discord' | 'instagram' | 'linkedin' | 'x'
const iconPaths: Record<IconName, string> = {
  check: 'm4 12 5 5L20 6', arrow: 'M5 12h14m-6-6 6 6-6 6', plus: 'M12 5v14M5 12h14',
  menu: 'M4 6h16M4 12h16M4 18h16', close: 'm6 6 12 12M6 18 18 6', lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3',
  trend: 'm3 17 6-6 4 4 8-10m-6 0h6v6', music: 'M10 18V5l10-2v13M10 18a3 3 0 1 1-3-3h3m10 1a3 3 0 1 1-3-3h3',
  connect: 'm8 16-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0m-3-2 6-6',
  rocket: 'M14 5c3-3 7-3 7-3s0 4-3 7l-7 7-5-5 8-6ZM6 11H2l3-5h7M11 16v5l5-3v-7M5 15l-3 7 7-3M15 6h.01',
  cube: 'm12 2 10 5v10l-10 5L2 17V7l10-5Zm0 10v10M2 7l10 5 10-5M7 4.5l10 5',
  growth: 'M12 21V11M12 14C4 14 2 8 3 3c6 0 9 4 9 8m0 3c0-7 4-11 10-11 0 7-4 11-10 11',
  mail: 'M3 5h18v14H3zM3 5l9 8 9-8', phone: 'M5 2h4l2 5-3 2c2 4 3 5 7 7l2-3 5 2v4c0 2-2 3-4 2C9 19 5 15 2 6c-1-2 1-4 3-4Z',
  discord: 'M7 5 4 6 2 18l5 2 1-3m9-12 3 1 2 12-5 2-1-3M7 5h10M7 16c3 2 7 2 10 0M8 11v2m8-2v2',
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm2-6h.01',
  linkedin: 'M3 9v12M3 4v.01M9 21V9h5v2c4-5 7-2 7 3v7M14 11v10', x: 'M4 3h4l12 18h-4L4 3Zm16 0L4 21',
}
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>
}

export function Logo({ light = false }: { light?: boolean }) {
  const { t } = useLuneraLocale()
  return <span className="ln-logo"><img src={`/logo/weiyu-logo-web-${light ? 'light' : 'dark'}.svg`} alt="" width="28" height="28" /><span>{t("微域生光")}</span></span>
}

export function ButtonLink({ href, children, light = false, blue = false, external = false, className = '' }: { href?: string; children: ReactNode; light?: boolean; blue?: boolean; external?: boolean; className?: string }) {
  const reduced = useReducedMotion()
  const appearance = {
    className: `ln-button ${light ? 'ln-button-light' : ''} ${blue ? 'ln-button-blue' : ''} ${className}`,
    whileHover: reduced ? undefined : { y: -2, scale: 1.02 },
    whileTap: reduced ? undefined : { scale: 0.97 },
  }
  // 未接入下载服务时使用真实按钮，点击仅保留动效，不伪造跳转或下载。
  if (!href) return <motion.button type="button" {...appearance}>{children}</motion.button>
  const Component = external ? motion.a : MotionLink
  return <Component {...appearance} href={href}
    target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
    {children}
  </Component>
}

function LanguageSwitch({ basePath, closeMenu }: { basePath: string; closeMenu: () => void }) {
  const { locale } = useLuneraLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [suffix, setSuffix] = useState('')
  useEffect(() => {
    const update = () => setSuffix(window.location.search + window.location.hash)
    update()
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [pathname])
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const relative = pathname.slice(basePath.length)
  return <div className="ln-language-switch" role="group" aria-label={locale === 'zh' ? '切换语言' : 'Language'}>
    {(['zh', 'en'] as const).map(language => language === locale
      ? <span key={language} lang={language === 'zh' ? 'zh-CN' : 'en'} aria-current="true">{language === 'zh' ? '中' : 'EN'}</span>
      : <Link key={language} href={`${root}${language === 'en' ? '/en' : ''}${relative}${suffix}`} hrefLang={language === 'zh' ? 'zh-CN' : 'en'} lang={language === 'zh' ? 'zh-CN' : 'en'} aria-label={language === 'zh' ? '切换为中文' : 'Switch to English'} scroll={false} onNavigate={event => {
        // 同页锚点变化不一定触发 hashchange；导航瞬间读取，保留最新的查询与段落位置。
        event.preventDefault()
        closeMenu()
        router.push(`${root}${language === 'en' ? '/en' : ''}${relative}${window.location.search}${window.location.hash}`, { scroll: false })
      }}>{language === 'zh' ? '中' : 'EN'}</Link>)}
  </div>
}

function Navigation({ basePath }: { basePath: string }) {
  const { t } = useLuneraLocale()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const reduced = useReducedMotion()
  const menuId = useId()
  const links = [
    { label: t("产品功能"), href: `${basePath}#feature` }, { label: t("博客"), href: `${basePath}/blog` },
    { label: t("价格方案"), href: `${basePath}#pricing` }, { label: t("联系我们"), href: `${basePath}/contact` },
  ]
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  return <motion.nav className="ln-nav" aria-label={t("主导航")} initial={reduced ? false : { y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
    <div className="ln-nav-bar">
      <Link href={basePath} aria-label={t("微域生光首页")} onClick={() => setOpen(false)}><Logo /></Link>
      <div className="ln-nav-links">{links.map(link => <Link key={link.label} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}</div>
      <LanguageSwitch basePath={basePath} closeMenu={() => setOpen(false)} /><ButtonLink className="ln-nav-download">{t("下载应用")}</ButtonLink>
      <motion.button className="ln-menu-toggle" type="button" aria-label={open ? t("关闭菜单") : t("打开菜单")} aria-controls={menuId} aria-expanded={open} onClick={() => setOpen(value => !value)} whileTap={{ scale: 0.9 }}><Icon name={open ? 'close' : 'menu'} /></motion.button>
    </div>
    <AnimatePresence initial={false}>{open && <motion.div className="ln-mobile-menu" id={menuId} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}>
      {links.map(link => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
      <ButtonLink>{t("下载应用")}</ButtonLink>
    </motion.div>}</AnimatePresence>
  </motion.nav>
}

function Footer({ basePath }: { basePath: string }) {
  const { t } = useLuneraLocale()
  return <footer className="ln-footer"><div className="ln-container">
    <Reveal className="ln-footer-grid">
      <div className="ln-footer-brand"><Link href={basePath} aria-label={t("微域生光首页")}><Logo light /></Link><h3>{t("让财务管理更从容")}</h3><div className="ln-socials">{(['x', 'linkedin', 'instagram'] as const).map(name => <a href={`https://${name === 'x' ? 'x' : name}.com/`} target="_blank" rel="noreferrer" key={name} aria-label={name}><Icon name={name} /></a>)}</div></div>
      <div className="ln-footer-links"><p>{t("产品服务")}</p>{[[t("产品功能"), '#feature'], [t("价格方案"), '#pricing'], [t("工具集成"), '#integration'], [t("常见问题"), '#faq']].map(([label, path]) => <Link href={`${basePath}${path}`} key={label}>{label}</Link>)}</div>
      <div className="ln-footer-links"><p>{t("了解更多")}</p>{[[t("联系我们"), '/contact'], [t("博客"), '/blog'], [t("隐私政策"), '/legal-terms/privacy-policy'], [t("服务条款"), '/legal-terms/terms-and-conditions']].map(([label, path]) => <Link href={`${basePath}${path}`} key={label}>{label}</Link>)}</div>
    </Reveal>
    <div className="ln-footer-bottom"><Link href="/templates">{t("微域生光：模板市场")}</Link><span>{t("模板预览 · 数据仅作演示")}</span><TemplateFiling /></div>
  </div></footer>
}

export function LuneraShell({ basePath, locale = 'zh', children }: { basePath: string; locale?: TemplateLocale; children: ReactNode }) {
  const t = getTranslator(locale)
  return <LocaleContext.Provider value={locale}><MotionConfig reducedMotion="user"><div className="ln-site" lang={locale === 'en' ? 'en' : 'zh-CN'}>
    <a className="ln-skip-link" href="#ln-main">{t("跳到主要内容")}</a>
    <Navigation basePath={basePath} /><main id="ln-main">{children}</main><Footer basePath={basePath} />
    <Link className="ln-template-brand" href="/templates" aria-label={locale === 'zh' ? '微域生光 · 模板首页' : 'Weelume · Template home'}>
      <img src="/logo/weiyu-logo-web-light.svg" alt="" width="28" height="28" />
      <span lang="zh-CN">微域生光</span>
    </Link>
  </div></MotionConfig></LocaleContext.Provider>
}

export function HeadingText({ title }: { title: string }) {
  const { locale } = useLuneraLocale()
  if (locale !== 'zh') return title
  // 中文展示标题按语义短句分行，分隔逗号与句末标点不参与排版。
  return title.split('，').map((phrase, index) => <span className="ln-title-phrase" key={index}>{phrase.replace(/[。！？；：]+$/u, '')}</span>)
}

export function SectionHeading({ badge, title, description, left = false, level = 2, children }: { badge?: string; title: string; description?: string; left?: boolean; level?: 1 | 2; children?: ReactNode }) {
  const Heading = level === 1 ? 'h1' : 'h2'
  return <Reveal className={`ln-heading ${left ? 'ln-heading-left' : ''}`}>
    {badge && <span className="ln-badge">{badge}</span>}<Heading><HeadingText title={title} /></Heading>
    {description && <p>{description}</p>}{children}
  </Reveal>
}

export function Faq({ basePath, items, contact = false }: { basePath: string; items: FaqItem[]; contact?: boolean }) {
  const { t } = useLuneraLocale()
  const [open, setOpen] = useState<number | null>(null)
  const id = useId()
  const reduced = useReducedMotion()
  return <section className="ln-faq ln-container" id="faq" aria-label={t("常见问题")}>
    <SectionHeading badge={t("常见问题")} title={contact ? t("你的疑问，在这里解答。") : t("你可能还想了解。")}
      description={contact ? t("还有其他问题？欢迎通过上方表单告诉我们。") : t("了解这些细节，轻松迈出下一步。")} left>
      {!contact && <ButtonLink href={`${basePath}/contact`}>{t("咨询我们")}</ButtonLink>}
    </SectionHeading>
    <Reveal className="ln-faq-list">{items.map((item, index) => <div className="ln-faq-item" key={item.question}>
      <h3><button type="button" id={`${id}-q-${index}`} aria-controls={`${id}-a-${index}`} aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>
        <span>{item.question}</span><motion.span animate={{ rotate: open === index ? 45 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}><Icon name="plus" /></motion.span>
      </button></h3>
      <AnimatePresence initial={false}>{open === index && <motion.div id={`${id}-a-${index}`} role="region" aria-labelledby={`${id}-q-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.28 }}><p>{item.answer}</p></motion.div>}</AnimatePresence>
    </div>)}</Reveal>
  </section>
}

export function ArticleCards({ basePath, posts }: { basePath: string; posts: LuneraArticle[] }) {
  const reduced = useReducedMotion()
  return <div className="ln-blog-grid">{posts.map((post, index) => <Reveal key={post.slug} delay={(index % 3) * 0.08}><MotionLink className="ln-blog-card" href={`${basePath}/blog/${post.slug}`} whileHover={reduced ? undefined : { y: -7 }} transition={{ duration: 0.25 }}>
    <div className="ln-blog-image"><img src={asset(post.image)} alt={post.imageAlt} width="600" height="450" loading="lazy" /></div>
    <div className="ln-blog-copy"><h3>{post.title}</h3><p>{post.description}</p></div>
  </MotionLink></Reveal>)}</div>
}

