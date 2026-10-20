'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useId, useState } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { Reveal } from '../../../shared/Reveal'
import { asset, faqs, features, plans, reviews, steps } from '../data'
import { cases } from '../cases'
import { useCopy } from './Locale'
import { Button, CaseCards, ContactSection, Heading, Partners, Rating, SiteShell, Title } from './Shared'
import { ChartCard, CustomersCard, Dashboard, TeamCard, WorkflowCard } from './Visuals'

function Hero({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const reduced = useReducedMotion()
  return <header className="gv-hero"><div className="gv-container gv-hero-grid"><Reveal className="gv-hero-copy"><span className="gv-eyebrow">{t('让团队的每一步更有方向', 'STRATEGY. CLARITY. GROWTH.')}</span><h1><Title>{t('为现代团队\n构建增长的力量', 'Strategy and growth\nfor modern teams')}</Title></h1><p>{t('微域生光与初创团队并肩，理顺运营流程，提升协作效率，为持续成长建立坚实基础。', 'Weelume partners with startups to streamline operations, elevate team performance, and build a foundation for lasting success.')}</p><div className="gv-actions"><Button href={`${basePath}#pricing`}>{t('即刻开始', 'Get started')}</Button><Button href={`${basePath}#contact`} outline>{t('联系我们', 'Contact us')}</Button></div></Reveal>
    <div className="gv-hero-visual" aria-label={t('客户与团队数据看板示意', 'Illustrative customer and activity dashboards')}><motion.div className="gv-hero-customers" initial={false} animate={reduced ? {} : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}><CustomersCard /></motion.div><motion.div className="gv-hero-chart" initial={false} animate={reduced ? {} : { y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}><ChartCard /></motion.div></div>
  </div><div className="gv-container"><Partners /></div></header>
}

export function FeaturesSection() {
  const { copy } = useCopy()
  const [active, setActive] = useState(0)
  const id = useId()
  const reduced = useReducedMotion()
  const selected = features[active]
  return <section className="gv-section gv-container" id="feature"><Reveal><Heading title={['为高效协作而生', 'Built for high performance']} description={['从目标对齐到业绩追踪，将团队成长需要的工具汇聚一处。', 'Weelume gives your team everything it needs to stay aligned, track performance, and scale with confidence — all in one place.']} /></Reveal>
    <div className="gv-feature-tabs" role="tablist" aria-label={copy(['产品功能', 'Product features'])}>{features.map((item, index) => <button key={item.visual} id={`${id}-tab-${index}`} role="tab" type="button" aria-selected={active === index} aria-controls={`${id}-panel`} tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % features.length : event.key === 'ArrowLeft' ? (index + features.length - 1) % features.length : event.key === 'Home' ? 0 : event.key === 'End' ? features.length - 1 : null
      if (next !== null) { event.preventDefault(); setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus() }
    }}><span aria-hidden="true">{['▱', '⌁', '▧', '♧'][index]}</span>{copy(item.label)}</button>)}</div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="gv-feature-panel gv-glass"><div className={`gv-feature-visual gv-visual-${selected.visual}`}><AnimatePresence mode="wait" initial={false}><motion.div key={active} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>{active === 0 ? <CustomersCard /> : active === 1 ? <ChartCard /> : active === 2 ? <WorkflowCard /> : <TeamCard />}</motion.div></AnimatePresence></div><div className="gv-feature-copy"><span className="gv-tag">{copy(selected.label)}</span><h3><Title>{copy(selected.title)}</Title></h3><p>{copy(selected.description)}</p></div></div>
  </section>
}

function Integrations({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const logos = ['kdSRwwUBLTr3qoCktInSsPrAsY', 'm7Dg9uyi7iZZXeom1aAT0HNaLuo', 'N8FBZysiz6WgiHLErPBtQwWyWw', 'YmV5QZ3HAKqE04RB7mMiJ57aGQ', 'HWO53n84YoZks8jiMsjlhjouwA', 'gPEzEKsNKBusglCCgdohBhJTkLQ', 'd4zw59yiCvizhPBrX6XR1a3i0g', 'mRPVggevTajUi56CB7BsPw4Zu8']
  return <section className="gv-section gv-container gv-integration" id="integration"><Reveal><Heading left title={['连接你熟悉的工具', 'Powerful integrations']} description={['将常用工具无缝连接，让工作流更顺畅，让信息保持同步。', 'Seamlessly integrate with your favorite tools to streamline workflows and keep everything in sync.']} /><Button href={`${basePath}#pricing`}>{t('即刻开始', 'Get started')}</Button><ol className="gv-integration-steps">{[t('探索 50+ 种工具集成', 'Explore 50+ supported integrations'), t('安全连接你的账户', 'Securely link your account'), t('同步信息，简化工作流', 'Sync and streamline your workflow')].map((label, i) => <li key={label}><span>0{i + 1}</span>{label}</li>)}</ol></Reveal><Reveal className="gv-integration-visual"><div className="gv-orbit-ring" /><div className="gv-orbit-center gv-glass"><img src="/logo/weiyu-logo-web-dark.svg" alt={t('微域生光', 'Weelume')} width="52" height="52" /></div>{logos.map((logo, i) => <div className={`gv-integration-logo gv-tool-${i} gv-glass`} key={logo}><img src={asset(logo)} alt="" width="44" height="44" loading="lazy" /></div>)}<small>{t('工具集成示意 · 连接服务待接入', 'Illustrative integrations · Live services not connected')}</small></Reveal></section>
}

function Pricing({ basePath }: { basePath: string }) {
  const { copy, t } = useCopy()
  const [active, setActive] = useState(0)
  const id = useId()
  const plan = plans[active]
  const reduced = useReducedMotion()
  return <section className="gv-band gv-pricing" id="pricing"><div className="gv-container"><Heading title={['灵活选择\n适合你的成长节奏', 'Flexible pricing']} /><div className="gv-pricing-grid"><div><div className="gv-plan-options" role="group" aria-label={t('选择套餐', 'Choose a plan')}>{plans.map((item, i) => <button type="button" key={item.price} aria-pressed={active === i} aria-controls={`${id}-details`} onClick={() => setActive(i)}><span className="gv-plan-radio" /><div><strong>{copy(item.name)}</strong><small>{copy(item.caption)}</small></div><span aria-hidden="true">↗</span></button>)}</div><Rating /></div><motion.div id={`${id}-details`} className="gv-plan-detail gv-dark-glass" key={plan.price} initial={{ opacity: reduced ? 1 : 0.5 }} animate={{ opacity: 1 }} aria-live="polite"><span className="gv-tag">{copy(plan.name)}</span><div className="gv-price">${plan.price}<small>{t('/ 月', '/ mo')}</small></div><p>{copy(plan.description)}</p><Button href={`${basePath}#contact`}>{t('预约演示', 'Schedule a demo')}</Button><ul>{plan.items.map(item => <li key={item[1]}><span aria-hidden="true">✓</span>{copy(item)}</li>)}</ul><small>{t('美元计价 · 模板演示套餐，尚未接入购买', 'USD · Demo plans, purchasing is not connected')}</small></motion.div></div></div></section>
}

function Reviews() {
  const { copy } = useCopy()
  return <div className="gv-review-grid">{reviews.map((item, i) => <Reveal key={item.image} delay={i * 0.06}><figure className="gv-review gv-glass"><span className="gv-stars" aria-label={copy(['五星评价示例', 'Example five-star review'])}>★★★★★</span><blockquote>{copy(item.quote)}</blockquote><figcaption><img src={asset(item.image)} alt="" width="44" height="44" loading="lazy" /><div><strong>{copy(item.name)}</strong><small>{copy(item.role)}</small></div></figcaption></figure></Reveal>)}</div>
}

function Faq({ basePath }: { basePath: string }) {
  const { t, copy } = useCopy()
  const [open, setOpen] = useState<number | null>(0)
  const id = useId()
  const reduced = useReducedMotion()
  return <section className="gv-section gv-container gv-faq" id="faq"><Reveal><Heading left title={['你的问题\n在这里解答', 'Your questions, answered']} description={['快速了解平台与服务，找到开始协作前需要的答案。', 'Get quick answers to the most common questions about our platform and services.']} /><Button href={`${basePath}#contact`} outline>{t('联系我们', 'Contact us')}</Button></Reveal><div className="gv-faq-list">{faqs.map((item, i) => <div className="gv-faq-item gv-glass" key={item.question[1]}><h3><button type="button" id={`${id}-q-${i}`} aria-expanded={open === i} aria-controls={`${id}-a-${i}`} onClick={() => setOpen(open === i ? null : i)}>{copy(item.question)}<motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>+</motion.span></button></h3><AnimatePresence initial={false}>{open === i && <motion.div role="region" id={`${id}-a-${i}`} aria-labelledby={`${id}-q-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : 0.24 }}><p>{copy(item.answer)}</p></motion.div>}</AnimatePresence></div>)}</div></section>
}

function HomeContent({ basePath }: { basePath: string }) {
  const { copy, t } = useCopy()
  return <><Hero basePath={basePath} /><section className="gv-container gv-dashboard-section" aria-label={t('团队工作空间示意', 'Illustrative team workspace')}><Reveal><Dashboard /></Reveal></section><section className="gv-section gv-container gv-steps" id="process">{steps.map((step, i) => <Reveal key={step.title[1]} delay={i * 0.08}><div className="gv-step-number">0{i + 1}<span /></div><h2>{copy(step.title)}</h2><p>{copy(step.description)}</p></Reveal>)}</section><FeaturesSection /><Integrations basePath={basePath} /><Pricing basePath={basePath} /><section className="gv-section gv-container" id="case-studies"><Reveal><Heading title={['共同成长的故事', 'Success stories']} description={['从流程优化到团队搭建，看看成长型企业如何迈向下一阶段。', 'Weelume has partnered with growing businesses to build foundations for sustainable success. Explore real stories of transformation.']} /></Reveal><CaseCards basePath={basePath} items={cases.slice(0, 4)} /><div className="gv-centered"><Button href={`${basePath}/case-studies`} outline>{t('探索更多案例', 'Read more')}</Button></div><Reviews /></section><Faq basePath={basePath} /><ContactSection /></>
}

export function HomeView(props: SiteTemplatePageProps) {
  return <SiteShell {...props}><HomeContent basePath={props.basePath} /></SiteShell>
}
