'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MotionConfig, motion, useInView } from 'framer-motion'
import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { TemplateFiling } from '../../../shared/TemplateFiling'
import type { SiteTemplatePageProps, TemplateLocale } from '../../../types'
import { animatedImages, extras, navigation, text, type Copy } from '../data'
import '../theme.css'

const Locale = createContext<TemplateLocale>('zh')
const motionQuery='(prefers-reduced-motion: reduce)'
function subscribeMotion(callback:()=>void) {
  const media=window.matchMedia(motionQuery)
  media.addEventListener('change',callback)
  return ()=>media.removeEventListener('change',callback)
}
// 使用外部订阅同步系统偏好的实时变化，不能只读取首次挂载时的媒体查询快照。
export function useMotionPreference() {
  return useSyncExternalStore(subscribeMotion,()=>window.matchMedia(motionQuery).matches,()=>true)
}
export function MotionImage({ src, alt, loading, className }: { src:string; alt:string; loading?:'lazy'|'eager'; className?:string }) {
  const reduced=useMotionPreference()
  const still=reduced&&(src.endsWith('.gif')||animatedImages.includes(src))
  return <img src={still?src.replace(/\.(gif|webp)$/,'-still.webp'):src} alt={alt} loading={loading} className={className} />
}
export function useCopy() {
  const locale = useContext(Locale)
  return { locale, t: (zh: string, en: string) => locale === 'en' ? en : zh, copy: (value: Copy) => text(value, locale) }
}
export function Brand({ light = false }: { light?: boolean }) {
  const { t } = useCopy()
  return <span className="hm-brand"><img src={`/logo/weiyu-logo-web-${light ? 'light' : 'dark'}.svg`} width="24" height="24" alt="" /><span>{t('微域生光', 'Weelume')}<sup>®</sup></span></span>
}
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="hm-arrow-link" href={href}><span>{children}</span><span aria-hidden="true">↗</span></Link>
}
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useMotionPreference()
  return <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: reduced ? 0 : .55 }}>{children}</motion.div>
}

function Navigation({ basePath, dark }: { basePath: string; dark: boolean }) {
  const { t, copy, locale } = useCopy()
  const pathname = usePathname()
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [pastFirstScreen, setPastFirstScreen] = useState(false)
  const id = useId()
  const root = locale === 'en' ? basePath.replace(/\/en$/, '') : basePath
  const suffix = pathname.slice(basePath.length)
  const target = `${root}${locale === 'zh' ? '/en' : ''}${suffix}`
  const close = () => { dialog.current?.close(); setOpen(false); trigger.current?.focus() }
  useEffect(() => {
    const update = () => setPastFirstScreen(window.scrollY >= window.innerHeight)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [pathname])
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])
  return <>
    <header className={`hm-header${dark ? ' hm-light' : ''}`}>
      <Link href={basePath} aria-label={t('微域生光首页', 'Weelume home')}><Brand light={dark} /></Link>
      <div className="hm-header-right"><span className="hm-weekday"><span aria-hidden="true">✳</span>{t('让每一天都有新想法', 'A good day for a new idea')}</span><Link className="hm-language" href={target} hrefLang={locale === 'zh' ? 'en' : 'zh-CN'} aria-label={t('切换到英文', 'Switch to Chinese')} scroll={false} onNavigate={event => { event.preventDefault(); router.push(target + window.location.search + window.location.hash, { scroll: false }) }}>{locale === 'zh' ? 'EN' : '中'}</Link></div>
    </header>
    <div className={`hm-menu-rail${pastFirstScreen ? ' hm-menu-rail-auto' : ''}`} onPointerMove={event => {
      // 只更新局部 CSS 位置，避免鼠标移动触发整页 React 重渲染。
      if (event.pointerType === 'mouse') event.currentTarget.style.setProperty('--hm-menu-y', `${event.clientY}px`)
    }} onPointerLeave={event => event.currentTarget.style.removeProperty('--hm-menu-y')}>
      <div className="hm-menu-edge" aria-hidden="true" />
      <button ref={trigger} className="hm-menu-button" aria-controls={id} aria-expanded={open} aria-label={t('打开菜单', 'Open menu')} onClick={() => { dialog.current?.showModal(); setOpen(true) }}><svg className="hm-menu-shape" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M100 0C64 150 0 350 0 500S64 850 100 1000Z" /></svg><span aria-hidden="true"><i /><i /><i /></span></button>
    </div>
    <dialog ref={dialog} id={id} className="hm-menu" aria-label={t('全站导航', 'Site navigation')} onCancel={event => { event.preventDefault(); close() }} onClose={() => setOpen(false)}>
      <div className="hm-menu-top"><Link href={basePath} onClick={close}><Brand light /></Link><button className="hm-close" onClick={close} aria-label={t('关闭菜单', 'Close menu')}>×</button></div>
      <div className="hm-menu-body"><nav aria-label={t('主要页面', 'Main pages')}>{navigation.map((item, i) => <motion.div key={item.path} initial={false} animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }} transition={{ delay: i * .035 }}><Link href={`${basePath}${item.path}`} onClick={close} aria-current={pathname === `${basePath}${item.path}` ? 'page' : undefined}><small>0{i+1}</small><span>{copy(item.label)}</span><span aria-hidden="true">↗</span></Link></motion.div>)}</nav><aside><p className="hm-doodle" aria-hidden="true">hello<br />there ☺</p><p>{t('让创意与人心相遇', 'Good ideas. Human connections.')}</p><Link href={`${basePath}/contact`} onClick={close}>{t('从一句你好开始', 'Start with hello')} ↗</Link><Link href={`${basePath}/careers`} onClick={close}>{t('加入我们', 'Join the studio')}</Link><Link href={`${basePath}/internship`} onClick={close}>{t('实习机会', 'Internships')}</Link></aside></div>
    </dialog>
  </>
}

export function Media({ src, alt, className, controls = false }: { src: string; alt: string; className?: string; controls?: boolean }) {
  const { t } = useCopy()
  const video = useRef<HTMLVideoElement>(null)
  const visible = useInView(video, { amount: .15 })
  const reduced = useMotionPreference()
  const [failed, setFailed] = useState(false)
  const [paused, setPaused] = useState(false)
  const isVideo = /\.(mp4|webm)$/.test(src)
  useEffect(() => {
    const element = video.current
    if (!element || controls) return
    const update = () => {
      if (!visible || reduced || paused || document.hidden) element.pause()
      else void element.play().catch(cause => {
        if (cause instanceof DOMException && cause.name === 'AbortError') console.debug('[hellomonday/media] 播放被导航或暂停中断', { src })
        else { console.error('[hellomonday/media] 播放失败', { src, cause }); setFailed(true) }
      })
    }
    update(); document.addEventListener('visibilitychange', update)
    return () => { element.pause(); document.removeEventListener('visibilitychange', update) }
  }, [visible, reduced, paused, controls, src])
  const poster=src===extras.hero?'/templates/hellomonday/assets/hero-poster.webp':src===extras.productHero?'/templates/hellomonday/assets/product-poster.webp':undefined
  return <figure className={`hm-media ${className||''}`}>{isVideo ? <video ref={video} src={src} poster={poster} muted={!controls} loop={!controls} playsInline controls={controls || failed} preload="metadata" aria-label={alt} onLoadedMetadata={event=>{if(reduced)event.currentTarget.currentTime=1.5}} onError={() => { console.error('[hellomonday/media] 素材加载失败', { src }); setFailed(true) }} /> : <MotionImage src={src} alt={alt} loading="lazy" />}{isVideo&&!controls&&!reduced&&<button className="hm-media-toggle" onClick={()=>setPaused(p=>!p)} aria-label={paused?t('播放动画','Play animation'):t('暂停动画','Pause animation')} aria-pressed={paused}>{paused?'▷':'Ⅱ'}</button>}{failed && <figcaption role="status">{t('媒体未能播放，请使用播放控件重试', 'Media could not play. Please retry using the controls.')}</figcaption>}</figure>
}

function Footer({ basePath }: { basePath: string }) {
  const { t, copy } = useCopy()
  const invitations = [
    [t('想一起创造？', 'Have a project?'), t('聊聊合作', 'Work with us'), '/contact'],
    [t('想打个招呼？', 'Want to say hello?'), t('从你好开始', 'Start a conversation'), '/contact?type=hello'],
    [t('想成为伙伴？', 'Want to join us?'), t('加入创意团队', 'Join the team'), '/careers'],
    [t('想探索和学习？', 'Curious to learn?'), t('成为实习伙伴', 'Become an intern'), '/internship'],
  ]
  return <footer className="hm-footer"><div className="hm-contact-grid">{invitations.map(([label,title,path])=><div key={path}><p>{label}</p><ArrowLink href={`${basePath}${path}`}>{title}</ArrowLink></div>)}</div><div className="hm-footer-main"><div><Link href={basePath}><Brand /></Link><p>{t('让创意与人心相遇', 'Good ideas. Human connections.')}</p><span>{t('品牌 · 数字产品 · 互动体验', 'Branding · Digital products · Experiences')}</span></div><nav aria-label={t('页脚导航', 'Footer navigation')}>{navigation.map(item=><Link key={item.path} href={`${basePath}${item.path}`}>{copy(item.label)}</Link>)}</nav><div className="hm-footer-links"><Link href={`${basePath}/privacy`}>{t('隐私说明', 'Privacy')}</Link><Link href={`${basePath}/terms`}>{t('使用条款', 'Terms')}</Link><Link href="/templates">{t('微域生光：模板市场', 'Weelume: template marketplace')} ↗</Link><button onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>{t('回到顶部', 'Back to top')} ↑</button></div></div><div className="hm-footer-bottom"><span>© 2026 {t('微域生光', 'Weelume')}</span><span>{t('参考案例素材仅用于内部模板预览', 'Reference media for internal template preview')}</span><TemplateFiling /></div></footer>
}

export function Shell({ basePath, locale = 'zh', children, dark = false }: SiteTemplatePageProps & { children: ReactNode; dark?: boolean }) {
  const reduced=useMotionPreference()
  return <Locale.Provider value={locale}><MotionConfig reducedMotion={reduced?'always':'never'}><div className={`hm-site${dark ? ' hm-dark' : ''}`}><a className="hm-skip" href="#main-content">{locale === 'en' ? 'Skip to content' : '跳转至正文'}</a><Navigation basePath={basePath} dark={dark} /><main id="main-content" tabIndex={-1}>{children}</main><Footer basePath={basePath} /><Link className="hm-market-logo" href="/templates" aria-label={locale === 'en' ? 'Weelume: template marketplace' : '微域生光：模板市场'}><img src="/logo/weiyu-logo-web-light.svg" width="24" height="24" alt="" /><span>{locale === 'en' ? 'Weelume' : '微域生光'}</span></Link></div></MotionConfig></Locale.Provider>
}

