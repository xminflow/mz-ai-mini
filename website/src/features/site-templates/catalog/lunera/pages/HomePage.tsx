'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { asset, templatePurchaseUrl } from '../data'
import { getContent } from '../content'
import { getTranslator } from '../messages'
import { useLuneraLocale } from '../components/Locale'
import { CountUp, Reveal } from '../components/Motion'
import { Partners } from '../components/Partners'
import { ArticleCards, ButtonLink, Faq, HeadingText, Icon, LuneraShell, SectionHeading } from '../components/Shared'
import '../theme.css'

function Hero({ basePath }: SiteTemplatePageProps) {
  const { locale, t } = useLuneraLocale()
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 65])
  return <header ref={ref} className="ln-hero">
    <div className="ln-hero-sky" aria-hidden="true" />
    <Reveal className="ln-hero-heading"><h1>{t("看清每一笔收支")}<span className="ln-hero-line">{locale === 'zh' ? '让财务管理更从容' : 'Your future, clearer.'}</span></h1><p>{t("用清晰的数据、智能预算与实时洞察，掌握资金动态，规划每一个下一步。")}</p></Reveal>
    <div className="ln-hero-visual">
      <motion.div className="ln-phone-wrap" style={{ y: phoneY }} initial={reduced ? false : { opacity: 0, y: 55 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}><img className="ln-phone" src={asset(locale === 'zh' ? 'phone-zh.svg' : 'phone.png')} alt={t("微域生光应用中的支付卡片与近期交易展示")} width="973" height="2100" fetchPriority="high" /></motion.div>
      <motion.div className="ln-float ln-sales" initial={{ opacity: 0 }} whileInView={{ opacity: 1, y: reduced ? 0 : [0, -9, 0] }} transition={{ opacity: { duration: 0.6, delay: 0.5 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut' } }}>
        <p>{t("应用商店新增收入")}</p><strong>$2,144.37</strong><span className="ln-sales-change"><em>+7%</em>{t("较上周增长")}</span>
      </motion.div>
      <motion.div className="ln-float ln-spending" initial={{ opacity: 0 }} whileInView={{ opacity: 1, y: reduced ? 0 : [0, 10, 0] }} transition={{ opacity: { duration: 0.6, delay: 0.65 }, y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } }}><span className="ln-music"><Icon name="music" /></span><div><strong>$1,235</strong><em>+2%</em></div><p>{t("休闲娱乐支出")}</p></motion.div>
      <motion.span className="ln-float-label ln-label-secure" initial={reduced ? false : { opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.35 }} viewport={{ once: true }}><Icon name="lock" />{t("安心支付")}</motion.span>
      <motion.span className="ln-float-label ln-label-track" initial={reduced ? false : { opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.45 }} viewport={{ once: true }}><Icon name="trend" />{t("高效追踪")}</motion.span>
    </div>
    <Reveal className="ln-hero-bottom" delay={0.1}><div className="ln-users"><div>{['sarah.png', 'marcus.png', 'priya.png'].map(file => <img src={asset(file)} alt="" key={file} width="42" height="42" />)}</div><span>{t("全球 4 万多位用户的共同选择")}</span></div><div className="ln-actions"><ButtonLink blue>{t("下载应用")}</ButtonLink><ButtonLink href={`${basePath}/contact`} light>{t("咨询销售")}</ButtonLink></div></Reveal>
  </header>
}


function Features() {
  const { locale, t } = useLuneraLocale()
  const { features } = getContent(locale)
  return <section className="ln-features ln-container" id="feature"><SectionHeading badge={t("产品功能")} title={t("化繁为简，让财务井井有条。")} /><div className="ln-feature-grid">{features.map((feature, index) => <Reveal className={`ln-feature-card ${index > 2 ? 'ln-feature-wide' : ''}`} key={feature.title} delay={(index % 3) * 0.08}>
    <div><h3>{feature.title}</h3><p>{feature.description}</p></div><img src={asset(feature.image)} alt={locale === 'zh' ? `${feature.title}示意图` : `${feature.title} illustration`} loading="lazy" width="309" height="180" />
  </Reveal>)}</div></section>
}

function Integrations() {
  const { t } = useLuneraLocale()
  const reduced = useReducedMotion()
  return <section className="ln-integrations" id="integration"><div className="ln-container"><SectionHeading badge={t("工具集成")} title={t("连接你熟悉的工具，让协作更顺畅。")} /><div className="ln-integration-visual" role="img" aria-label={t("五个工具图标环绕蓝色弧线排列，展示集成能力")}><div className="ln-integration-arc" />{[1, 2, 3, 4, 5].map((n, i) => <motion.div className={`ln-integration-icon ln-integration-icon-${n}`} key={n} initial={false} whileInView={{ y: reduced ? 0 : [0, -10, 0] }} transition={{ duration: 4.5, delay: i * 0.35, repeat: Infinity, ease: 'easeInOut' }}><img src={asset(`integration-${n}.png`)} alt="" width="58" height="58" loading="lazy" /></motion.div>)}</div></div></section>
}

function Process() {
  const { locale, t } = useLuneraLocale()
  const { steps } = getContent(locale)
  const reduced = useReducedMotion()
  return <section className="ln-process ln-container" aria-label={t("使用流程")}><div className="ln-process-heading"><SectionHeading badge={t("使用流程")} title={t("只需三步，让数据成为行动的起点。")} left /></div><div className="ln-process-cards">{steps.map((step, i) => <motion.article className="ln-process-card" key={step.title} style={{ top: 120 + i * 24 }} initial={reduced ? false : { y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65 }}>
    <div className="ln-process-title"><span><Icon name={step.icon} /></span><div><h3>{step.title}</h3><p>{step.description}</p></div></div><img src={asset(step.image)} alt={locale === 'zh' ? `${step.title}示意图` : `${step.title} illustration`} width="400" height="235" loading="lazy" /><span className="ln-step-number">0{i + 1}</span>
  </motion.article>)}</div></section>
}

function Pricing({ basePath }: SiteTemplatePageProps) {
  const { locale, t } = useLuneraLocale()
  const { plans } = getContent(locale)
  return <section className="ln-pricing ln-container" id="pricing"><SectionHeading badge={t("价格方案")} title={t("清晰的方案，看得见的价值。")} description={t("以下为美元月付演示价格，可按团队需求选择。")} /><div className="ln-price-grid">{plans.map((plan, i) => <Reveal className={`ln-price-card ${i === 1 ? 'ln-price-featured' : ''}`} key={plan.name} delay={i * 0.1}>
    {i === 1 && <div className="ln-best-deal">{t("推荐方案")}</div>}<h3><span><Icon name={plan.icon} /></span>{plan.name}</h3><div className="ln-price"><strong>${plan.price}</strong><span>{t("/ 月")}</span></div><p>{plan.description}</p>
    <ButtonLink href={i === 2 ? `${basePath}/contact` : templatePurchaseUrl} blue={i === 1} external={i !== 2}>{i === 2 ? t("联系我们") : t("立即开始")}</ButtonLink>
    <ul>{plan.features.map(feature => <li key={feature}><Icon name="check" />{feature}</li>)}</ul>
  </Reveal>)}</div></section>
}

function Testimonials() {
  const { locale, t } = useLuneraLocale()
  const { reviews } = getContent(locale)
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1140)
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const visible = width > 850 ? 3 : width > 580 ? 2 : 1
  const maxIndex = reviews.length - visible
  const current = Math.min(index, maxIndex)
  const move = (direction: number) => setIndex((current + direction + maxIndex + 1) % (maxIndex + 1))
  return <section className="ln-reviews ln-container"><Reveal className="ln-review-heading"><h2><HeadingText title={t("让管理更轻松，让变化看得见。")} /></h2><div><p>{t("少一些琐碎，多一些清晰。看看创业者和团队如何用更从容的方式管理财务。")}</p><ButtonLink href="https://senja.io/" light external>{t("分享体验")}</ButtonLink></div></Reveal>
    <div className="ln-carousel" role="region" aria-roledescription={t("轮播图")} aria-label={t("用户评价")} tabIndex={0} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) } }}>
      <div ref={ref} className="ln-review-viewport"><motion.div className="ln-review-track" style={{ '--ln-visible': visible } as CSSProperties} animate={{ x: -current * ((width + 16) / visible) }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 32 }} onPanEnd={(_, info) => { if (Math.abs(info.offset.x) > 40) move(info.offset.x < 0 ? 1 : -1) }}>
        {reviews.map((review, i) => <article className={`ln-review-card ${i === 1 ? 'ln-review-dark' : ''}`} key={review.name} aria-hidden={i < current || i >= current + visible}>
          <div className="ln-review-person"><img src={asset(review.image)} alt="" width="44" height="44" loading="lazy" /><div><strong>{review.name}</strong><p>{review.role}</p></div></div><div className="ln-stars" aria-label={t("评分：5 星，满分 5 星")}>★★★★★</div><h3>{review.title}</h3><p>{review.text}</p>
        </article>)}
      </motion.div></div>
      <div className="ln-carousel-controls"><motion.button type="button" aria-label={t("上一组评价")} onClick={() => move(-1)} whileTap={{ scale: 0.9 }}><span className="ln-arrow-left"><Icon name="arrow" /></span></motion.button><div className="ln-carousel-dots">{Array.from({ length: maxIndex + 1 }, (_, i) => <button type="button" key={i} aria-label={locale === 'zh' ? `查看第 ${i + 1} 组评价` : `Show review group ${i + 1}`} aria-current={i === current ? 'true' : undefined} onClick={() => setIndex(i)} />)}</div><motion.button type="button" aria-label={t("下一组评价")} onClick={() => move(1)} whileTap={{ scale: 0.9 }}><Icon name="arrow" /></motion.button></div>
      <span className="ln-sr-only" aria-live="polite">{locale === 'zh' ? `正在显示第 ${current + 1} 至 ${current + visible} 条评价，共 ${reviews.length} 条` : `Showing reviews ${current + 1} to ${current + visible} of ${reviews.length}`}</span>
    </div>
    <div className="ln-stats"><CountUp value={locale === 'zh' ? 1 : 10} suffix={locale === 'zh' ? '万+' : 'K+'} label={t("用户共同选择")} /><CountUp value={99.9} decimals={1} suffix="%" label={t("服务可用率")} /><CountUp value={locale === 'zh' ? 5000 : 50} suffix={locale === 'zh' ? '万+' : 'M+'} label={t("已追踪金额（美元）")} /></div>
  </section>
}

export default function HomePage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  const t = getTranslator(locale)
  const { articles, homeFaq } = getContent(locale)
  return <LuneraShell basePath={basePath} locale={locale}><Hero basePath={basePath} /><Partners /><Features /><Integrations /><Process /><Pricing basePath={basePath} /><Testimonials /><Faq basePath={basePath} items={homeFaq} />
    <section className="ln-home-blog ln-container"><SectionHeading badge={t("博客")} title={t("多一份洞察，让每一笔钱更有价值。")} /><ArticleCards basePath={basePath} posts={articles.slice(0, 3)} /><Reveal className="ln-read-more"><ButtonLink href={`${basePath}/blog`} light>{t("阅读更多")}</ButtonLink></Reveal></section>
  </LuneraShell>
}
