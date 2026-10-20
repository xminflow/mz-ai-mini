'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { asset, caseDetails, type Copy } from '../data'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'
import '../theme.css'

export type CaseDetailSlug = keyof typeof caseDetails

function CaseDetailContent({ slug, ...props }: SiteTemplatePageProps & { slug: CaseDetailSlug }) {
  const { copy, t } = useCopy()
  const item = caseDetails[slug]
  const resultLabel = (result: readonly [string, string, string]) => t(result[1], result[2])
  return <>
    <header className="cc-page-header cc-detail-header"><span className="cc-pill">005 / {t('案例研究', 'CASE STUDY')}</span><h1>{copy(item.title)}</h1><p>{copy(item.intro)}</p></header>
    <div className="cc-detail-page">
      <div className="cc-detail-hero"><img src={asset(item.image)} alt={copy(item.title)} /></div>
      <div className="cc-detail-grid">
        <section><span className="cc-kicker">{t('挑战', 'THE CHALLENGE')}</span><h2>{copy(item.challenge)}</h2></section>
        <section><span className="cc-kicker">{t('解决方案', 'THE SOLUTION')}</span><h2>{copy(item.solution)}</h2></section>
      </div>
      <section className="cc-detail-results"><span className="cc-kicker">{t('结果', 'THE RESULTS')}</span><div>{item.results.map(result => <article key={result[0]}><strong>{result[0]}</strong><small>{resultLabel(result)}</small></article>)}</div></section>
      <div className="cc-detail-actions"><Button href={`${props.basePath}/case-studies`}>{t('返回案例', 'Back to Case Studies')}</Button><Button href={`${props.basePath}/contact`} light>{t('开始你的项目', 'Start Your Project')}</Button></div>
    </div>
  </>
}

export function CaseDetailPage(props: SiteTemplatePageProps & { slug: CaseDetailSlug }) {
  return <Shell {...props}><CaseDetailContent {...props} /></Shell>
}

export const caseDetailCopy = (value: Copy) => value
