'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { SiteTemplatePageProps } from '../../../types'
import { Reveal } from '../../../shared/Reveal'
import { image, projects, services } from '../data'
import { Button, Hand, Heading, ProjectArrow, SiteShell } from './Shared'
import { useCopy } from './Locale'

function Hero() {
  const reduced = useReducedMotion()
  const { t } = useCopy()
  return <section className="st-hero" id="main-content">
    <motion.div className="st-hero-note st-note-left" animate={reduced ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}><img src={image('ruler.png')} alt={t('尺子与铅笔', 'A ruler and pencil')} /><Hand>{t('⟵ 拖动 ⟶', '⟵ drag ⟶')}</Hand></motion.div>
    <Hand>{t('好奇驱动一切', 'curiosity fuels everything')}</Hand>
    <div className="st-hero-title"><h1>{t('设计始于', 'Design ')}<mark>{t('匠心', 'crafted')}</mark><br />{t('每一份坚持', 'with intention')}</h1><p>{t('从纸上开始，把想法打磨成清晰设计。', 'Ideas start on paper and become clear design.')}</p><span className="st-hero-swoop" aria-hidden="true">⌁</span></div>
    <motion.div className="st-hero-note st-note-bottom" animate={reduced ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}><img src={image('sketchbook.png')} alt={t('素描本与铅笔', 'A sketch book and pencil')} /><Hand>{t('提醒：相信过程', 'remind: trust the process')}</Hand></motion.div>
    <div className="st-hero-media"><video autoPlay muted loop playsInline poster={image('kaito.jpg')}><source src={image('hero-video.mp4')} type="video/mp4" /></video><Hand>{t('2026 项目开放', 'available for 2026')}</Hand></div>
    <div className="st-hero-wheel"><img src={image('colour-wheel.png')} alt={t('色轮', 'Colour wheel')} /><Hand>{t('向下探索 ↓', 'scroll to explore ↓')}</Hand></div>
  </section>
}

function TrustedBy() {
  const { t } = useCopy()
  return <section className="st-trusted"><Hand>{t('合作伙伴', 'trusted by')}</Hand><div className="st-logo-marquee" aria-label={t('合作伙伴示例', 'Selected client logos')}>{['GRANDNAME', 'BRANDNAME', 'A / M', 'PLACEHOLDER', 'PARTNER', 'BRANDNAME'].map((name, index) => <span key={`${name}-${index}`}><b aria-hidden="true">{['◉', '△', 'A', '⬡', '▣', '◌'][index]}</b>{name}</span>)}</div></section>
}

function AboutTeaser({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <section className="st-section st-about-teaser"><Hand>{t('关于我们', 'about us')}</Hand><Reveal><h2>{t('微域生光是 Dung 在河内创立的设计工作室。我们从纸上开始，把每个想法打磨成耐看的设计。', "Weelume is Dung's Hanoi-based design studio. We turn ideas into thoughtful work that lasts.")}</h2><Button href={`${basePath}/about`}>{t('了解我们的故事', 'Read our story')}</Button></Reveal></section>
}

function WorksTeaser({ basePath }: { basePath: string }) {
  const { t, copy } = useCopy()
  return <section className="st-section st-works-teaser"><div className="st-section-head"><Hand>{t('精选作品', 'proudly')}</Hand><Heading title={t('精选作品', 'Selected works')} description={t('值得探索的想法 ↓', 'idea worth exploring ↓')} /></div><div className="st-project-grid">{projects.map((project, index) => <Reveal key={project.slug} delay={index * .06}><a className="st-project-card" href={`${basePath}/works#${project.slug}`}><div className="st-project-image"><img src={project.cover} alt={project.title} loading="lazy" /><span>{copy(project.type)}</span></div><h3>{project.title}<ProjectArrow /></h3></a></Reveal>)}</div><div className="st-centered"><Button href={`${basePath}/works`} outline>{t('查看全部作品', 'View all projects')}</Button></div></section>
}

function Services() {
  const { t, copy } = useCopy()
  return <section className="st-section st-services"><Hand>✓ {t('已确认', 'approved')}</Hand><Heading title={t('我们的服务', 'our services')} description={t('让品牌被记住。', 'Making brands memorable.')} /><div className="st-service-list">{services.map((service, index) => <div key={copy(service)}><span>0{index + 1}</span><strong>{copy(service)}</strong><ProjectArrow /></div>)}</div></section>
}

function Process() {
  const { t } = useCopy()
  const steps = [['发现', 'Discovery', '倾听提问，找到机会。', 'Listen, ask, and find the opportunity.'], ['概念', 'Concept', '自由勾勒，明确方向。', 'Sketch freely and shape a clear direction.'], ['设计', 'Design', '打磨细节，让系统自然流动。', 'Refine the details until the system feels effortless.'], ['交付', 'Delivery', '让作品进入真实世界。', 'Bring the work into the real world.']]
  return <section className="st-section st-process"><Hand>{t('我们的流程', 'our process')}</Hand><Heading title={t('扎根手作的流程', 'A process rooted in craft')} description={t('小步骤 → 大成果', 'small steps → big results')} /><div className="st-process-grid">{steps.map(([zh, en, zhText, enText], index) => <Reveal key={en} delay={index * .08}><span>{t('步骤', 'Step')} {index + 1}</span><h3>{t(zh, en)}</h3><p>{t(zhText, enText)}</p></Reveal>)}</div></section>
}

function Testimonial() {
  const { t } = useCopy()
  return <section className="st-testimonial"><Hand>{t('客户评价', 'testimonials')}</Hand><Heading title={t('客户怎么说', 'What clients say')} /><blockquote>{t('“从第一张草图到最终文件，微域生光都为每一个细节投入了令人难忘的心力。”', '“Weelume brings an incredible level of care to every detail, from the first sketch to the final files.”')}<cite>— Maria Nguyen<br /><small>{t('Leaf & Letter 创始人', 'Founder, Leaf & Letter')}</small></cite></blockquote></section>
}

function ContactTeaser({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <section className="st-contact-teaser"><Hand>{t('一起工作吧', "let's work together")}</Hand><h2>{t('微域生光正在接受 2026 年精选项目。', 'Weelume is accepting select projects for 2026.')}</h2><p>{t('重视手作与清晰设计？来聊聊你的想法。', 'Value craft and clarity? Tell us what you are making.')}</p><Button href={`${basePath}/contact`}>{t('开始一个项目', 'Start a project')}</Button></section>
}

export function HomeView({ basePath, locale }: SiteTemplatePageProps) {
  return <SiteShell basePath={basePath} locale={locale}><Hero /><TrustedBy /><AboutTeaser basePath={basePath} /><WorksTeaser basePath={basePath} /><Services /><Process /><Testimonial /><ContactTeaser basePath={basePath} /></SiteShell>
}

