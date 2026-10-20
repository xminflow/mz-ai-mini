'use client'

import Link from 'next/link'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useRef, useState } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { categories, projects, services, worldItems, type Category, type Project } from '../data'
import { AmbientSound, Button, Reveal, Shell, useCopy } from './Shared'
import { Scene } from './Scene'
import { WorldVideo } from './WorldVideo'
import { HeroMotion, ParallaxImage, TitleLines } from './Motion'

function ProjectCard({ project, basePath, index }: { project: Project; basePath: string; index: number }) {
  const { t, copy } = useCopy()
  return <Reveal className="us-project-wrap" delay={index % 2 * .12}><Link href={`${basePath}/projects/${project.id}`} className="us-project-card" data-project-card={project.id}>
    <div className="us-project-image"><ParallaxImage><img src={project.images[0]} alt={copy(project.description)} width="1024" height="670" loading={index < 2 ? 'eager' : 'lazy'} /></ParallaxImage><span className="us-project-arrow" aria-hidden="true">↗</span></div>
    <div className="us-project-caption"><div><h3>{project.name}</h3><span>{project.categories.map(category => copy(categories.find(item => item.id === category)!.label)).join(' / ')}</span></div><small>{String(index + 1).padStart(2, '0')}</small></div>
    <span className="us-sr-only">{t('查看项目详情', 'View project details')}</span>
  </Link></Reveal>
}

function HomeContent({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <>
    <section className="us-hero"><Scene /><HeroMotion className="us-hero-content"><motion.p className="us-eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .15, duration: .6 }}>{t('品牌 · 数字体验 · 动态影像', 'A BRAND, DIGITAL & MOTION STUDIO')}</motion.p><h1><TitleLines lines={[t('让灵感', 'Creating the'), t('超越预期', 'unexpected')]} /></h1><Button href={`${basePath}/projects`}>{t('探索我们的作品', 'View our work')}</Button></HeroMotion>
      <div className="us-hero-bottom"><div><AmbientSound /><Link href={`${basePath}/world`} className="us-world-teaser">{t('走进创意世界', 'A world of possibilities')} ↗</Link></div><Link className="us-world-orbit us-circle" href={`${basePath}/world`} aria-label={t('探索创意世界', 'Explore our world')}><span aria-hidden="true">◎</span></Link><span className="us-hero-copyright">©2026</span></div>
    </section>
    <section className="us-intro us-container"><Reveal><p className="us-eyebrow">{t('保持好奇 持续创造', 'UNCOMMON THINKING. UNEXPECTED POSSIBILITIES.')}</p><h2>{t('我们相信\n好的创意总有新的可能', 'A different perspective\nMakes all the difference').split('\n').map(line => <span key={line}>{line}</span>)}</h2></Reveal><p>{t('微域生光将品牌、设计与技术融为一体。从一个不寻常的想法出发，创造鲜明、细腻、值得被记住的数字体验。', 'We bring brand, design and technology together. Starting with a different way of seeing, we create expressive digital experiences that stay with you.')}</p></section>
    <section className="us-container us-home-projects"><div className="us-section-heading"><h2>{t('精选作品', 'Selected projects')}</h2><Link href={`${basePath}/projects`}>{t('查看全部作品', 'View all projects')} ↗</Link></div><div className="us-project-grid">{projects.slice(0, 4).map((project, index) => <ProjectCard key={project.id} project={project} index={index} basePath={basePath} />)}</div><p className="us-reference-note">{t('参考作品来自 Unseen Studio，仅用于展示模板结构与排版。', 'Reference projects by Unseen Studio, shown to demonstrate the template’s structure and layout.')}</p></section>
    <section className="us-services us-container"><div className="us-section-heading"><h2>{t('把想法变成可能', 'From an idea to a possibility')}</h2><span>01 — 03</span></div><div className="us-service-grid">{services.map((service, index) => <ServiceCard key={index} index={index} service={service} />)}</div></section>
  </>
}
function ServiceCard({ index, service }: { index: number; service: typeof services[number] }) {
  const { copy } = useCopy()
  return <Reveal className="us-glass us-service-card" delay={index * .1}><span className="us-service-symbol" aria-hidden="true">{['✳', '↗', '◎'][index]}</span><small>0{index + 1}</small><h3>{copy(service.title)}</h3><p>{copy(service.body)}</p></Reveal>
}
export function HomeView(props: SiteTemplatePageProps) { return <Shell {...props}><HomeContent basePath={props.basePath} /></Shell> }

function ProjectsContent({ basePath }: { basePath: string }) {
  const { t, copy } = useCopy()
  const [filter, setFilter] = useState<Category>('all')
  const visible = filter === 'all' ? projects : projects.filter(project => project.categories.includes(filter))
  return <div className="us-projects-page"><header className="us-page-heading us-container"><p className="us-eyebrow">{t('不同视角 意外之美', 'A DIFFERENT POINT OF VIEW')}</p><h1>{t('精选作品', 'Selected projects')}<sup>{String(projects.length).padStart(2, '0')}</sup></h1><p>{t('品牌、数字体验、动态影像与实验性创作\n探索想法如何成为真实的体验', 'Brand, digital, motion and creative experiments.\nExplore what happens when an idea comes to life.')}</p></header>
    <section className="us-container" aria-label={t('作品目录', 'Project collection')}><div className="us-filters us-glass" role="group" aria-label={t('按类型筛选作品', 'Filter projects by category')}>{categories.map(category => <button key={category.id} type="button" aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{copy(category.label)}<sup>{category.id === 'all' ? projects.length : projects.filter(project => project.categories.includes(category.id)).length}</sup></button>)}</div><p className="us-filter-status" aria-live="polite">{t(`正在展示 ${visible.length} 个项目`, `Showing ${visible.length} projects`)}</p><div className="us-project-grid" key={filter}>{visible.map((project, index) => <ProjectCard project={project} key={project.id} index={index} basePath={basePath} />)}</div><p className="us-reference-note">{t('本页案例及素材属于原作者，非微域生光客户项目。', 'Reference projects and imagery belong to their original creators, not Weelume client work.')}</p></section>
  </div>
}
export function ProjectsView(props: SiteTemplatePageProps) { return <Shell {...props}><ProjectsContent basePath={props.basePath} /></Shell> }

function ContactForm() {
  const { t } = useCopy()
  const id = useId()
  const [submitted, setSubmitted] = useState(false)
  return <form className="us-contact-form us-glass" onSubmit={event => { event.preventDefault(); setSubmitted(true) }} onChange={() => setSubmitted(false)}>
    <h2>{t('分享你的想法', 'Tell us your idea')}</h2><p>{t('我们期待听见你正在构想的下一件事', 'We’d love to hear what you have in mind.')}</p>
    <div className="us-form-grid"><label htmlFor={`${id}-name`}>{t('你的姓名', 'Your name')}<input id={`${id}-name`} name="name" required minLength={2} autoComplete="name" placeholder={t('如何称呼你', 'What should we call you?')} /></label><label htmlFor={`${id}-email`}>{t('电子邮箱', 'Email address')}<input id={`${id}-email`} name="email" required type="email" autoComplete="email" placeholder="you@example.com" /></label></div>
    <label htmlFor={`${id}-service`}>{t('你希望一起创造什么', 'What would you like to create?')}<select id={`${id}-service`} name="service" required defaultValue=""><option value="" disabled>{t('选择项目类型', 'Select a project type')}</option>{services.map((service, index) => <option value={index} key={index}>{t(...service.title)}</option>)}<option value="other">{t('其他创意合作', 'Something else')}</option></select></label>
    <label htmlFor={`${id}-message`}>{t('关于这个想法', 'About your idea')}<textarea id={`${id}-message`} name="message" required minLength={10} rows={4} placeholder={t('和我们聊聊目标、时间和你的期待……', 'A little about your goals, timing and what you’re imagining…')} /></label>
    <label className="us-consent"><input name="consent" type="checkbox" required /><span>{t('我已阅读并了解下方的本地演示说明', 'I have read the local demo notice below.')}</span></label>
    <button className="us-button" type="submit">{t('校验项目意向', 'Check project enquiry')}<span aria-hidden="true">↗</span></button>
    <p className="us-form-note">{t('演示表单：仅在本地校验，不会发送或保存任何信息。', 'Demo form: validation happens locally. No information is sent or saved.')}</p><p className="us-form-status" role="status">{submitted ? t('校验通过。这是本地演示，你的信息尚未发送或保存。', 'Validation passed. This is a local demo; your information has not been sent or saved.') : ''}</p>
  </form>
}
function ContactContent() {
  const { t } = useCopy()
  const [tab, setTab] = useState<'business' | 'general'>('business')
  const id = useId()
  const faqs = [
    [t('可以一起做哪些项目？', 'What can we create together?'), t('从品牌识别、官网与交互设计，到三维视觉与动态影像。具体范围与交付会在项目开始前共同确认。', 'Brand identities, websites, interactive experiences, 3D visuals and motion. Scope and deliverables are agreed together before a project begins.')],
    [t('发起项目需要准备什么？', 'What should I prepare?'), t('一个简短的目标说明、预期时间与大致范围就足够开始沟通。不必提前准备完整的设计方案。', 'A short description of your goals, timing and expected scope is a useful starting point. You do not need a finished creative brief.')],
    [t('这里的表单会发送信息吗？', 'Does this form send my information?'), t('当前模板仅演示本地校验，不连接邮件、数据库或第三方服务，也不保存输入内容。', 'This template demonstrates local validation only. It does not connect to email, a database or a third-party service, and does not save your input.')],
  ]
  return <><section className="us-contact-hero"><Scene contact /><HeroMotion className="us-contact-intro"><p className="us-eyebrow">{t('新的可能 从对话开始', 'NEW POSSIBILITIES START WITH A CONVERSATION')}</p><h1><TitleLines lines={[t('你好', 'Say hello')]} /></h1><p>{t('期待听见你的下一个想法', 'We look forward to hearing from you.')}</p><div className="us-contact-tabs" role="tablist" aria-label={t('联系类型', 'Enquiry type')}>{(['business', 'general'] as const).map(value => <button type="button" key={value} id={`${id}-${value}`} role="tab" aria-selected={tab === value} aria-controls={`${id}-panel`} onClick={() => setTab(value)}>{value === 'business' ? t('项目合作', 'New business') : t('日常交流', 'General')} ↗</button>)}</div><div className="us-contact-tab-panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`}><p>{tab === 'business' ? t('一个新品牌、一段数字旅程，或一个还未命名的想法。', 'A new brand, a digital journey, or an idea without a name yet.') : t('聊聊灵感、设计，或一次有趣的合作。', 'A conversation about inspiration, design, or a collaboration.')}</p><a className="us-text-link" href="#enquiry">{t('向我们介绍一下', 'Tell us a little more')} ↘</a></div></HeroMotion><div className="us-contact-orb" aria-hidden="true">✳</div></section>
    <section id="enquiry" className="us-contact-section us-container"><div><p className="us-eyebrow">{t('一起创造意想不到', 'LET’S CREATE THE UNEXPECTED')}</p><h2>{t('每个好想法\n都值得被认真听见', 'Every good idea\nDeserves a conversation').split('\n').map(line => <span key={line}>{line}</span>)}</h2><p>{t('从简单的对话开始，找到适合你的创意方向。', 'Start with a conversation. Find a creative direction that feels right for you.')}</p><div className="us-faq">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div><ContactForm /></section>
  </>
}
export function ContactView(props: SiteTemplatePageProps) { return <Shell {...props}><ContactContent /></Shell> }

function WorldContent() {
  const { t, copy, locale } = useCopy()
  const reduced = useReducedMotion()
  const viewport = useRef<HTMLDivElement>(null)
  const [list, setList] = useState(false)
  const [selected, setSelected] = useState<(typeof worldItems)[number] | null>(null)
  const [bounds, setBounds] = useState({ left: -2900, right: 0, top: -1150, bottom: 0 })
  const [zoom, setZoom] = useState(1)
  const dialog = useRef<HTMLDialogElement>(null)
  const origin = useRef<HTMLElement | null>(null)
  const x = useMotionValue(-900)
  const y = useMotionValue(-280)
  const dragged = useRef(false)
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    const observer = new ResizeObserver(() => setBounds({ left: Math.min(0, el.clientWidth - 3700 * zoom), right: 0, top: Math.min(0, el.clientHeight - 1550 * zoom), bottom: 0 }))
    observer.observe(el)
    return () => observer.disconnect()
  }, [zoom, list])
  useEffect(() => {
    if (!selected) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [selected])
  const open = (item: typeof worldItems[number], button: HTMLElement) => { if (dragged.current) return; origin.current = button; setSelected(item); dialog.current?.showModal() }
  const close = () => { dialog.current?.close(); setSelected(null); origin.current?.focus() }
  const reset = () => { x.set(-900); y.set(-280); setZoom(1) }
  const displayTitle = (item: typeof worldItems[number]) => locale === 'en' && item.title ? item.title : copy(item.description)
  return <div className="us-world-page"><header className="us-page-heading us-container"><p className="us-eyebrow">{t('未完成的想法 无边界的想象', 'THE UNCOMMON. THE UNUSUAL. THE UNEXPECTED.')}</p><h1>{t('创意世界', 'Our world')}<sup>58</sup></h1><p>{t('一个容纳好奇心的地方\n拖动探索图像、动态影像与日常灵感', 'A place for curiosity.\nDrag to explore imagery, motion and everyday inspiration.')}</p></header>
    <div className="us-world-toolbar us-container"><div className="us-view-switch" role="group" aria-label={t('画廊显示方式', 'Gallery view')}><button type="button" aria-pressed={!list} onClick={() => setList(false)}>{t('自由探索', 'Explore')}</button><button type="button" aria-pressed={list} onClick={() => setList(true)}>{t('全部灵感', 'All inspiration')}</button></div>{!list && <div className="us-world-controls"><button type="button" aria-label={t('缩小画廊', 'Zoom out')} disabled={zoom <= .7} onClick={() => setZoom(value => Math.max(.7, value - .15))}>−</button><button type="button" onClick={reset}>{t('重置', 'Reset')}</button><button type="button" aria-label={t('放大画廊', 'Zoom in')} disabled={zoom >= 1.3} onClick={() => setZoom(value => Math.min(1.3, value + .15))}>+</button></div>}</div>
    {list ? <div className="us-world-list us-container">{worldItems.map(item => <button className="us-world-tile us-glass" type="button" key={item.id} onClick={event => open(item, event.currentTarget)}>{item.type === 'video' ? <WorldVideo src={item.file} label={displayTitle(item)} /> : <img src={item.file} alt={displayTitle(item)} width="400" height="400" loading="lazy" />}<span>{displayTitle(item)}<small>↗</small></span></button>)}</div> : <div ref={viewport} className="us-world-viewport" tabIndex={0} role="region" aria-label={t('可拖拽的创意画廊，也可用方向键移动', 'Draggable creative gallery. Use arrow keys to move.')} onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); x.set(Math.min(0, Math.max(bounds.left, x.get() + (event.key === 'ArrowLeft' ? 150 : event.key === 'ArrowRight' ? -150 : 0)))); y.set(Math.min(0, Math.max(bounds.top, y.get() + (event.key === 'ArrowUp' ? 150 : event.key === 'ArrowDown' ? -150 : 0)))) }
    }}><motion.div className="us-world-board" drag dragConstraints={bounds} dragElastic={.07} dragMomentum={!reduced} style={{ x, y, scale: zoom, transformOrigin: '0 0' }} onDragStart={() => { dragged.current = true }} onDragEnd={() => { window.setTimeout(() => { dragged.current = false }, 100) }}>{worldItems.map((item, index) => <button type="button" key={item.id} className="us-world-floating" style={{ left: `${(index % 12) * 305 + (Math.floor(index / 12) % 2) * 70}px`, top: `${Math.floor(index / 12) * 295 + (index % 3) * 20}px`, rotate: `${(index % 5 - 2) * 3}deg` }} onClick={event => open(item, event.currentTarget)} aria-label={displayTitle(item)} tabIndex={-1}>{item.type === 'video' ? <WorldVideo src={item.file} /> : <img src={item.file} alt="" width="260" height="230" draggable={false} />}<span>{displayTitle(item)}</span></button>)}</motion.div><span className="us-drag-hint">{t('拖动探索 · 点击查看 · 方向键移动', 'Drag to explore · Click to discover · Arrow keys to move')}</span></div>}
    <p className="us-reference-note us-container">{t('影像与创意练习来自 Unseen Studio 及其创作者，仅作内部参考展示。', 'Imagery and creative studies by Unseen Studio and its creators. Internal reference preview.')}</p>
    <dialog ref={dialog} className="us-world-dialog" aria-label={t('创意作品预览', 'Creative study preview')} onCancel={close} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) close() }}><button type="button" className="us-circle us-dialog-close" onClick={close} aria-label={t('关闭作品预览', 'Close preview')}>×</button>{selected && <div>{selected.type === 'video' ? <video src={selected.file} controls autoPlay muted playsInline aria-label={displayTitle(selected)} /> : <img src={selected.file} alt={displayTitle(selected)} width="1000" height="800" />}<p>{displayTitle(selected)}<span>#{selected.id}</span></p>{selected.localizedCaption && <p>{copy(selected.localizedCaption)}</p>}<small>{t('参考影像 · 原作者保留全部权利', 'Reference imagery · All rights remain with its creators')}</small></div>}</dialog>
  </div>
}
export function WorldView(props: SiteTemplatePageProps) { return <Shell {...props}><WorldContent /></Shell> }

function ProjectContent({ project, basePath }: { project: Project; basePath: string }) {
  const { t, copy } = useCopy()
  const index = projects.findIndex(item => item.id === project.id)
  const next = projects[(index + 1) % projects.length]
  return <article className="us-case"><header className="us-case-heading us-container"><Link href={`${basePath}/projects`}>← {t('所有作品', 'All projects')}</Link><p className="us-eyebrow">{project.categories.map(category => copy(categories.find(item => item.id === category)!.label)).join(' / ')}</p><h1>{project.name}</h1><p>{copy(project.description)}</p></header><div className="us-case-cover"><img src={project.images[0]} alt={copy(project.description)} width="1600" height="1000" /></div>
    <section className="us-case-overview us-container"><div><p className="us-eyebrow">{t('项目视角', 'Project perspective')}</p><h2>{copy(project.description)}</h2></div><div><h3>{t('关于这个参考案例', 'About this reference')}</h3><p>{t('这个案例将视觉设计与数字表达结合，让品牌的个性成为体验的一部分。从构图到交互，重点始终是如何让内容被清晰感知，并留下鲜明的记忆。', 'This reference brings visual design and digital expression together, making character part of the experience. Composition and interaction work together to make the content clear and memorable.')}</p><p className="us-reference-note">{t('原始项目由 Unseen Studio 创作。本页为模板演示解读，非微域生光交付或客户背书。', 'Original work by Unseen Studio. This page is a template interpretation, not a Weelume delivery or client endorsement.')}</p><a className="us-text-link" href={project.source} target="_blank" rel="noreferrer">{t('查看原始来源', 'View original source')} ↗</a></div></section>
    {project.images.length > 1 && <div className="us-case-gallery us-container">{project.images.slice(1).map((src, imageIndex) => <Reveal key={src}><img src={src} alt={t(`${project.name} 视觉细节 ${imageIndex + 1}`, `${project.name} visual detail ${imageIndex + 1}`)} width="1200" height="900" loading="lazy" /></Reveal>)}</div>}
    {project.categories.includes('experiment') && <Experiment />}
    <section className="us-case-next us-container"><p className="us-eyebrow">{t('下一个项目', 'NEXT PROJECT')}</p><Link href={`${basePath}/projects/${next.id}`}><h2>{next.name}</h2><span aria-hidden="true">↗</span></Link></section>
  </article>
}
function Experiment() {
  const { t } = useCopy()
  const [hue, setHue] = useState(0)
  return <section className="us-experiment us-container"><div className="us-experiment-orb" style={{ filter: `hue-rotate(${hue}deg)` }} aria-hidden="true" /><div><h2>{t('让颜色跟随你的想象', 'Follow your curiosity')}</h2><p>{t('拖动色相滑块，体验这个模板中的材质研究。原站实验可通过来源链接查看。', 'Move the hue slider to explore this template’s material study. Visit the source link for the original experiment.')}</p><label>{t('色相', 'Hue')}<input type="range" min="0" max="360" value={hue} onChange={event => setHue(Number(event.target.value))} /></label></div></section>
}
export function ProjectView(props: SiteTemplatePageProps & { projectId: string }) {
  const project = projects.find(item => item.id === props.projectId)
  if (!project) throw new Error(`[unseen] Unknown project: ${props.projectId}`)
  return <Shell {...props}><ProjectContent project={project} basePath={props.basePath} /></Shell>
}

function PolicyContent({ kind }: { kind: 'privacy' | 'terms' }) {
  const { t } = useCopy()
  const privacy = kind === 'privacy'
  return <article className="us-policy us-container"><p className="us-eyebrow">{t('模板使用说明', 'TEMPLATE INFORMATION')}</p><h1>{privacy ? t('隐私说明', 'Privacy information') : t('使用条款', 'Terms of use')}</h1><p>{t('更新日期：2026 年 10 月 16 日', 'Updated: 16 October 2026')}</p>{privacy ? <><h2>{t('本地演示与信息处理', 'Local demo and information handling')}</h2><p>{t('联系表单仅使用浏览器原生规则进行本地校验，不发送请求，也不保存姓名、邮箱或留言。刷新或离开页面会清空本次输入。', 'The enquiry form uses browser validation locally. It does not send requests or save your name, email or message. Reloading or leaving the page clears the input.')}</p><h2>{t('声音与媒体', 'Sound and media')}</h2><p>{t('环境音只在点击后由浏览器合成。视频由本站本地托管，作品预览中可自行播放与暂停。', 'Ambient audio is synthesized by the browser after you opt in. Videos are hosted locally and can be played or paused in the media preview.')}</p><h2>{t('宿主网站', 'The host website')}</h2><p>{t('模板嵌入现有网站运行，宿主网站可能有独立的访问日志或统计配置。正式发布前，应根据实际部署完善隐私文本与用户选择。', 'This template runs within an existing website. The host may have separate access logs or analytics settings. Privacy information and user choices should be completed for an actual deployment.')}</p></> : <><h2>{t('模板预览范围', 'Scope of the preview')}</h2><p>{t('此模板用于内部展示整站结构、双语排版、响应式布局与交互设计。联系表单是本地演示，未连接业务服务。', 'This template is an internal demonstration of site structure, bilingual typography, responsive layouts and interactions. The form is a local demo and is not connected to a business service.')}</p><h2>{t('素材与案例权利', 'Imagery and project rights')}</h2><p>{t('参考站为 Unseen Studio。参考图片、视频及场景影像的权利归原作者所有；当前未发现可供商用再分发的公开许可。对外交付前需替换为已获许可的素材，或取得权利人许可。', 'The reference website is Unseen Studio. Reference images, videos and scene imagery belong to their creators. No public commercial redistribution licence has been identified. Replace these assets with licensed material or secure permission before external delivery.')}</p><h2>{t('字体与运行方式', 'Fonts and implementation')}</h2><p>{t('字体复用项目本地 MiSans 与 Poppins，遵循各自许可。空间背景采用预渲染影像与原生 WebGL 折射水面，并非原站完整 WebGL 三维引擎。', 'The template reuses the project’s local MiSans and Poppins fonts under their respective licences. The environment uses pre-rendered imagery and native WebGL refraction and interactive ripple materials, rather than the reference site’s complete WebGL engine.')}</p></>}</article>
}
export function PolicyView(props: SiteTemplatePageProps & { kind: 'privacy' | 'terms' }) { return <Shell {...props}><PolicyContent kind={props.kind} /></Shell> }
