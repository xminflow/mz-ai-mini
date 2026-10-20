'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { createContext, Suspense, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { SiteTemplatePageProps, TemplateLocale } from '../../../types'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import { Reveal, TitleLines } from './Motion'
import { PageScrollbar } from './PageScrollbar'
import { faqs, photo, rooms, testimonials, type Copy, type Room } from '../data'
import '../theme.css'

const Locale = createContext<TemplateLocale>('zh')
export function useCopy() {
  const locale = useContext(Locale)
  return { locale, t: (zh: string, en: string) => locale === 'zh' ? zh : en, copy: (text: Copy) => text[locale === 'zh' ? 0 : 1] }
}

export function Brand() {
  const { t } = useCopy()
  return <span className="nb-brand">
    <img src="/logo/weiyu-logo-web-light.svg" width="24" height="24" alt="" />
    <span>{t('微域生光', 'Weelume')}</span>
  </span>
}
export function Button({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return <Link className={`nb-button ${light ? 'nb-button-light' : ''}`} href={href}>{children}<span aria-hidden="true">↗</span>
  </Link>
}
export function Title({ children }: { children: string }) {
  return <TitleLines>{children}</TitleLines>
}
export function Heading({ eyebrow, title, description, left = false }: { eyebrow?: Copy; title: Copy; description?: Copy; left?: boolean }) {
  const { copy } = useCopy()
  return <Reveal className={`nb-heading ${left ? 'nb-heading-left' : ''}`}>{eyebrow && <span className="nb-eyebrow">
    <i aria-hidden="true">⠿</i>{copy(eyebrow)}</span>}<h2>
      <Title>{copy(title)}</Title>
    </h2>{description && <p>{copy(description)}</p>}</Reveal>
}

function Navigation({ basePath }: { basePath: string }) {
  const { t, locale } = useCopy()
  const [open, setOpen] = useState(false)
  const menu = useId()
  const toggle = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const root = locale === 'en' ? basePath.slice(0, -3) : basePath
  const target = `${root}${locale === 'zh' ? '/en' : ''}${pathname.slice(basePath.length)}`
  const links = [
    [`${basePath}/cases`, t('生活场景', 'Use cases')], [`${basePath}#pricing`, t('价格方案', 'Pricing')],
    [`${basePath}/about`, t('关于我们', 'About')], [`${basePath}/updates`, t('产品更新', 'Updates')],
    [`${basePath}/waitlist`, t('预约体验', 'Reserve')], [`${basePath}/contact`, t('联系我们', 'Contact')],
  ]
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
      // 菜单展开时限制 Tab 在导航内循环，关闭后将焦点还给触发按钮。
      if (event.key === 'Tab') {
        const items = [...document.querySelectorAll<HTMLElement>('.nb-nav a, .nb-nav button')]
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return <>
    <nav className={`nb-nav ${open ? 'is-open' : ''}`} aria-label={t('主导航', 'Main navigation')}>
      <div className="nb-nav-bar">
        <Link className="nb-nav-home" href={basePath} aria-label={t('微域生光首页', 'Weelume home')} onClick={() => setOpen(false)}>
          <Brand />
        </Link>
        <Link className="nb-language" href={target} hrefLang={locale === 'zh' ? 'en' : 'zh-CN'} aria-label={locale === 'zh' ? 'Switch to English' : '切换为中文'} scroll={false} onNavigate={event => { event.preventDefault(); setOpen(false); router.push(target + window.location.search + window.location.hash, { scroll: false }) }}>{locale === 'zh' ? 'EN' : '中'}</Link>
        <button ref={toggle} type="button" aria-expanded={open} aria-controls={menu} aria-label={open ? t('关闭菜单', 'Close menu') : t('打开菜单', 'Open menu')} onClick={() => setOpen(!open)}><svg width="25" height="18" viewBox="0 0 25 18" aria-hidden="true">
          <path d={open ? 'M6.5 3l12 12M18.5 3l-12 12' : 'M1 3h23M1 9h9M1 15h23'} stroke="currentColor" strokeWidth="1.5" />
        </svg></button>
      </div>
      <AnimatePresence initial={false}>{open && <motion.div id={menu} className="nb-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
        <div className="nb-menu-links">{links.map(([href, label], i) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setOpen(false)}>
          <small>0{i + 1}</small>{label}<span aria-hidden="true">↗</span>
        </Link>)}</div>
        <div className="nb-menu-bottom">
          <span>{t('安静的居家机器人', 'THE HELPFUL HOME ROBOTICS COMPANY')}</span>
          <span>● {t('内测进行中 · 演示', 'BETA IN PROGRESS · DEMO')}</span>
        </div>
      </motion.div>}</AnimatePresence>
    </nav>{open && <button className="nb-backdrop" tabIndex={-1} aria-label={t('关闭菜单', 'Close menu')} onClick={() => setOpen(false)} />}</>
}

function PlanSelection({ id }: { id: string }) {
  const { t } = useCopy()
  const search = useSearchParams()
  const selected = search.get('plan')
  const initial = selected && ['standard', 'pro', 'care'].includes(selected) ? selected : 'standard'
  const [choice, setChoice] = useState<string | null>(null)
  return <label htmlFor={`${id}-plan`}>
    <span>{t('你选择的方案', 'Your selected plan')}</span>
    <select id={`${id}-plan`} name="plan" value={choice ?? initial} onChange={event => setChoice(event.target.value)}>
      <option value="standard">{t('微域生光 · 标准版', 'Weelume · Standard')}</option>
      <option value="pro">Weelume Pro</option>
      <option value="care">Weelume Care</option>
    </select>
  </label>
}

export function DemoForm({ kind = 'contact' }: { kind?: 'contact' | 'newsletter' | 'waitlist' }) {
  const { t } = useCopy()
  const id = useId()
  const [complete, setComplete] = useState(false)
  const newsletter = kind === 'newsletter'
  const waitlist = kind === 'waitlist'
  return <form className={`nb-form ${newsletter ? 'nb-newsletter' : 'nb-glass'}`} onChange={() => setComplete(false)} onSubmit={event => { event.preventDefault(); setComplete(true); if (process.env.NODE_ENV === 'development') console.debug('[nubo] demo form validated', { kind, result: 'local-only' }) }}>
    {waitlist && <Suspense fallback={<p role="status">{t('正在读取所选方案', 'Loading selected plan')}</p>}>
      <PlanSelection id={id} />
    </Suspense>}
    {!newsletter && <label htmlFor={`${id}-name`}>
      <span>01 / {t('姓名', 'Name')}</span>
      <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={80} placeholder={t('如何称呼你', 'Your name')} />
    </label>}
    <label htmlFor={`${id}-email`}>
      <span>{newsletter ? '' : '02 / '}{t('邮箱', 'Email')}</span>
      <input id={`${id}-email`} type="email" name="email" autoComplete="email" required placeholder={t('你的邮箱地址', 'Your email address')} />
    </label>
    {!newsletter && <>
      <div className="nb-form-pair">
        <label htmlFor={`${id}-city`}>
          <span>03 / {t('城市', 'City')}</span>
          <input id={`${id}-city`} name="city" autoComplete="address-level2" required placeholder={t('你生活的城市', 'Your city')} />
        </label>
        <label htmlFor={`${id}-home`}>
          <span>04 / {t('家庭类型', 'Household')}</span>
          <select id={`${id}-home`} name="household" required defaultValue="">
            <option disabled value="">{t('请选择', 'Select one')}</option>
            <option value="apartment">{t('公寓', 'Apartment')}</option>
            <option value="house">{t('独栋住宅', 'House')}</option>
            <option value="family">{t('有孩子或宠物', 'With children or pets')}</option>
          </select>
        </label>
      </div>
      {waitlist ? <fieldset className="nb-finish">
        <legend>05 / {t('喜欢的外观', 'Preferred finish')}</legend>{[['chalk', '云白', 'Chalk'], ['flax', '亚麻', 'Flax'], ['graphite', '石墨', 'Graphite']].map(([value, zh, en]) => <label key={value}>
          <input type="radio" name="finish" value={value} defaultChecked={value === 'chalk'} />
          <span className={`nb-swatch nb-swatch-${value}`} />{t(zh, en)}</label>)}</fieldset> : <label htmlFor={`${id}-reason`}>
        <span>05 / {t('咨询主题', 'Reason')}</span>
        <select id={`${id}-reason`} name="reason" defaultValue="product">
          <option value="product">{t('产品咨询', 'Product question')}</option>
          <option value="press">{t('媒体与合作', 'Press & partnership')}</option>
          <option value="support">{t('服务支持', 'Support')}</option>
        </select>
      </label>}
      <label htmlFor={`${id}-message`}>
        <span>06 / {t('想告诉我们的话', 'Message')}</span>
        <textarea id={`${id}-message`} name="message" rows={3} required={!waitlist} maxLength={2000} placeholder={t('希望它为你的生活做些什么', 'What would you like help with?')} />
      </label>
    </>}
    <button type="submit" className="nb-button">{newsletter ? t('订阅动态', 'Subscribe') : waitlist ? t('申请体验', 'Request access') : t('发送消息', 'Send message')}<span aria-hidden="true">↗</span>
    </button>
    <p className="nb-form-note" id={`${id}-notice`}>{t('演示表单：仅进行本地校验，信息不会发送或保存', 'Demo form: local validation only. Nothing is sent or saved.')}</p>
    <p role="status" aria-live="polite" className="nb-form-status">{complete ? t('校验成功 · 本次演示未发送或保存任何信息', 'Validated · No information was sent or saved in this demo.') : ''}</p>
  </form>
}

export function FAQ() {
  const { copy, t } = useCopy()
  const [active, setActive] = useState<number | null>(0)
  const id = useId()
  return <section id="faq" className="nb-container nb-section nb-faq">
    <Heading left eyebrow={['预约之前', 'Before you pre-order']} title={['那些实际的问题\n在这里找到答案', 'The practical\nanswers']} description={['发货、隐私、续航与服务，认真回答你关心的每一件事', 'Shipping, privacy, battery and care. The things you ask most often, answered clearly.']} />
    <div>{faqs.map((item, i) => <div className="nb-faq-item" key={i}>
      <h3>
        <button type="button" aria-expanded={active === i} aria-controls={`${id}-${i}`} id={`${id}-button-${i}`} onClick={() => setActive(active === i ? null : i)}>{copy(item.question)}<span aria-hidden="true">{active === i ? '−' : '+'}</span>
        </button>
      </h3>
      <div id={`${id}-${i}`} className={`nb-faq-answer ${active === i ? 'is-open' : ''}`} role="region" aria-labelledby={`${id}-button-${i}`} aria-hidden={active !== i}>
        <div>
        <p>{copy(item.answer)}</p>
        </div>
      </div>
    </div>)}<small>{t('产品信息为模板演示', 'Illustrative product information')}</small>
    </div>
  </section>
}

export function RoomCards({ basePath, items = rooms }: { basePath: string; items?: Room[] }) {
  const { copy, t } = useCopy()
  return <div className="nb-room-grid">{items.map((room, i) => <Reveal key={room.slug} delay={i % 2 * .12} tilt={i % 2 ? 3 : -3}>
    <Link className="nb-room-card nb-glass" href={`${basePath}/cases/${room.slug}`}>
      <div className="nb-image-wrap">
        <img src={photo(room.image)} alt={copy(room.name)} loading="lazy" width="900" height="675" />
        <span className="nb-image-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="nb-room-copy">
        <span className="nb-eyebrow">0{rooms.indexOf(room) + 1} / {copy(room.name)}</span>
        <h3>
          <Title>{copy(room.title)}</Title>
        </h3>
        <p>{copy(room.intro)}</p>
        <span className="nb-text-link">{t('走进这个场景', 'Explore this room')} ↗</span>
      </div>
    </Link>
  </Reveal>)}</div>
}

export function Testimonials() {
  const { copy, t } = useCopy()
  return <section className="nb-section nb-container">
    <Heading eyebrow={['一起生活的故事', 'Living with Weelume']} title={['来自那些\n已经相处的家庭', 'From the homes\nalready living with it']} description={['这些演示故事，描绘安静陪伴融入日常的样子', 'Illustrative stories of a quieter kind of help at home.']} />
    <div className="nb-review-grid">{testimonials.map(item => <Reveal key={item.name}>
      <article className="nb-review nb-glass">
        <span className="nb-stars" aria-label={t('演示评分 5 分', 'Demo rating: 5 out of 5')}>★★★★★</span>
        <h3>“{copy(item.quote)}”</h3>
        <p>{copy(item.body)}</p>
        <div className="nb-review-person">
          <img src={photo(item.image)} width="48" height="48" alt={t(`${item.name} 的演示肖像`, `Illustrative portrait of ${item.name}`)} loading="lazy" />
          <div>
            <strong>{item.name}</strong>
            <small>{copy(item.city)}</small>
          </div>
          <span>{t('内测故事', 'BETA STORY')}</span>
        </div>
      </article>
    </Reveal>)}</div>
  </section>
}

export function CTA({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <section className="nb-cta" id="reserve">
    <img src={photo('92rcfs7KQc6SbN12YQxjpMpHMo')} alt={t('居家机器人与温暖的生活空间', 'Home robot in a warm living space')} loading="lazy" />
    <div>
      <span className="nb-eyebrow">{t('让家，回归生活', 'A little more room for living')}</span>
      <h2>
        <Title>{t('把琐事交给它\n把时间留给生活', 'Make room\nfor your Weelume')}</Title>
      </h2>
      <div className="nb-actions">
        <Button href={`${basePath}/waitlist`}>{t('预约体验', 'Reserve yours')}</Button>
        <Button light href={`${basePath}/contact`}>{t('与我们聊聊', 'Get in touch')}</Button>
      </div>
    </div>
  </section>
}

export function QuickLinks({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <section className="nb-section nb-container">
    <Heading left eyebrow={['继续探索', 'Keep exploring']} title={['下一站\n从这里开始', 'Try one of these']} />
    <div className="nb-quick-grid">{[[`${basePath}#feature`, t('了解产品', 'How it works'), t('认识安静的能力与日常节奏', 'Capabilities and the daily rhythm')], [`${basePath}#faq`, t('常见问题', 'FAQ'), t('预约前，了解你关心的细节', 'Practical answers before you reserve')], [`${basePath}/waitlist`, t('加入候补名单', 'Join the waitlist'), t('选择外观，申请内测体验', 'Choose a finish and request access')]].map(([href, title, body], i) => <Link className="nb-glass" key={href} href={href}>
      <small>0{i + 1} ↗</small>
      <h3>{title}</h3>
      <p>{body}</p>
    </Link>)}</div>
  </section>
}

function Footer({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <footer className="nb-footer">
    <div className="nb-container">
      <div className="nb-footer-top">
        <div>
          <Link href={basePath}>
            <Brand />
          </Link>
          <h2>{t('让家的日常更从容', 'A quieter rhythm at home')}</h2>
          <p>{t('轻轻订阅，慢慢了解', 'Stay in the loop, gently')}</p>
          <DemoForm kind="newsletter" />
        </div>
        <div className="nb-footer-links">
          <span>{t('页面导航', 'Navigation')}</span>{[['', '首页', 'Home'], ['/cases', '生活场景', 'Use cases'], ['/about', '关于我们', 'About'], ['#pricing', '价格方案', 'Pricing'], ['/updates', '产品更新', 'Updates'], ['/waitlist', '候补名单', 'Waitlist'], ['/contact', '联系我们', 'Contact']].map(([path, zh, en]) => <Link key={path} href={basePath + path}>{t(zh, en)}</Link>)}</div>
        <div className="nb-footer-links">
          <span>{t('政策与说明', 'Legal & information')}</span>
          <Link href={`${basePath}/legal/privacy-and-cookies`}>{t('隐私与 Cookie', 'Privacy & cookies')}</Link>
          <Link href={`${basePath}/legal/terms-of-service`}>{t('服务条款', 'Terms of service')}</Link>
          <Link href={`${basePath}/404`}>{t('404 页面', '404 page')}</Link>
          <Link href="/templates">{t('微域生光：模板市场', 'Weelume: Template marketplace')}</Link>
        </div>
      </div>
      <div className="nb-footer-word" aria-hidden="true">weelume<span>®</span>
      </div>
      <div className="nb-footer-bottom">
        <span>© 2026 {t('微域生光 · 产品与故事均为演示', 'Weelume · Illustrative product & stories')}</span>
        <TemplateFiling />
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>{t('回到顶部', 'Back to top')} ↑</button>
      </div>
    </div>
  </footer>
}

export function SiteShell({ basePath, locale = 'zh', children }: SiteTemplatePageProps & { children: ReactNode }) {
  return <Locale.Provider value={locale}>
    <MotionConfig reducedMotion="user">
      <div className="nb-site" lang={locale === 'zh' ? 'zh-CN' : 'en'}>
        <a className="nb-skip" href="#nb-main">{locale === 'zh' ? '跳转到正文' : 'Skip to content'}</a>
        <Navigation basePath={basePath} />
        <main id="nb-main">{children}</main>
        <Footer basePath={basePath} />
        <PageScrollbar label={locale === 'zh' ? '页面滚动' : 'Page scroll'} />
        <Link href="/templates" className="nb-market-logo" aria-label={locale === 'zh' ? '微域生光 · 模板首页' : 'Weelume · Template home'}>
          <img src="/logo/weiyu-logo-web-light.svg" alt="" width="28" height="28" />
          <span lang="zh-CN">微域生光</span>
        </Link>
      </div>
    </MotionConfig>
  </Locale.Provider>
}

