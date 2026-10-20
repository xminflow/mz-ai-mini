'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { cases } from '../data'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function CasesPage({ basePath, locale }: SiteTemplatePageProps) {
  const { t, copy } = useCopy(locale)
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage"><p className="vl-kicker">{t('客户案例', 'Case studies')}</p><h1>{t('好的内容，留下真实结果', 'Good content leaves real results')}</h1><p className="vl-subpage-intro">{t('我们与不同阶段的品牌一起工作，从一条爆款视频到完整的社交增长系统。', 'We work with brands at every stage, from one high-performing video to a complete social growth system.')}</p><div className="vl-case-grid">{cases.map(item => <article key={item.brand} className="vl-case"><div className="vl-case-visual"><span className="vl-case-brand">{item.brand}</span><strong>{copy(item.title)}</strong><span>↗</span></div><div className="vl-case-copy"><h3>{copy(item.title)}</h3><p>{copy(item.text)}</p><div className="vl-case-stats">{item.stats.map(([value, unit, label]) => <span className="vl-case-stat" key={label}><strong>{value}{unit}</strong><small>{label}</small></span>)}</div></div></article>)}</div><div style={{ marginTop: 40 }}><Button href={`${basePath}/book-a-call`}>{t('做下一个案例', 'Become our next case study')}</Button></div></div></Shell>
}
