'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { experiments } from '../data'
import { Button, PageIntro, Shell, t } from '../components/Shell'

function ExperimentCard({ item, locale }: { item: typeof experiments[number]; locale: 'zh' | 'en' }) {
  const external = item.variant === 'type' || item.variant === 'gradient'
  return (
    <a className={`tf-experiment-card tf-experiment-${item.variant}`} href={external ? 'https://www.pexels.com/' : '#contact'} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {item.video ? <video src={item.video} poster={item.image || undefined} muted autoPlay loop playsInline preload="metadata" aria-label={t(locale, item.zh, item.en)} /> : item.image ? <img src={item.image} alt={t(locale, item.zh, item.en)} loading="eager" decoding="async" /> : <span className="tf-experiment-art" aria-hidden="true"><b>J</b><b>U</b></span>}
      <span className="tf-experiment-title">{t(locale, item.zh, item.en)}</span>
    </a>
  )
}

export default function ExperimentsPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  // 桌面端沿用源站的瀑布顺序：第一列包含「艺术工作坊」与社会影响力概念，避免卡片只在移动端出现。
  const desktopColumns = [[experiments[0], experiments[3], experiments[6], experiments[9]], [experiments[1], experiments[4], experiments[7]], [experiments[2], experiments[5], experiments[8]]] as const
  return (
    <Shell basePath={basePath} locale={locale}>
      <PageIntro locale={locale} title="Aiko Tanaka">
        <p>{t(locale, '专注清晰系统、流畅交互与有意义细节的产品与网页设计师。', 'Product & web designer focused on clean systems, smooth interactions, and meaningful details.')}</p>
        <div className="tf-button-row">
          <Button href={basePath}>{t(locale, '查看最新作品', 'My latest work')}</Button>
          <Button href="mailto:hello@aiko.com" secondary>{t(locale, '聊聊合作', "Let's chat")}</Button>
        </div>
      </PageIntro>
      <section id="experiments" className="tf-section tf-experiment-grid-desktop">
        {desktopColumns.map((column, index) => <div className="tf-experiment-column" key={index}>{column.map(item => <ExperimentCard item={item} locale={locale} key={item.en} />)}</div>)}
      </section>
      <section className="tf-section tf-experiment-grid-mobile">
        {experiments.map(item => <ExperimentCard item={item} locale={locale} key={item.en} />)}
      </section>
    </Shell>
  )
}
