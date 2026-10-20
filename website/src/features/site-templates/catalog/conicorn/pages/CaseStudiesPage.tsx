'use client'
import type { SiteTemplatePageProps } from '../../../types'
import { cases, asset } from '../data'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

function CaseStudiesContent(props: SiteTemplatePageProps) {
  const { copy, t } = useCopy()
  const slugs = ['ai-property-inquiry-chatbot-for-real-estate-firms', 'ai-project-management-automation-for-creative-teams', 'ai-workflow-automation-for-finance-saas-company'] as const

  return <>
    <header className="cc-page-header"><span className="cc-pill">005 / {t('案例', 'CASE STUDIES')}</span><h1>{t('真实业务，真实改变。', 'Real systems. Real outcomes.')}</h1><p>{t('探索我们为成长型企业构建的 AI 自动化系统。', 'Explore AI automation systems built for growing businesses.')}</p></header>
    <section className="cc-section cc-case-index">{cases.map((item, index) => <article className="cc-case" key={item.title[1]}><div className="cc-case-media"><img src={asset(item.image)} alt={copy(item.title)} /></div><h2>{copy(item.title)}</h2><p>{copy(item.text)}</p><Button href={`${props.basePath}/case-studies/${slugs[index]}`}>{t('阅读案例', 'Read Case Study')}</Button></article>)}</section>
  </>
}

export default function CaseStudiesPage(props: SiteTemplatePageProps) {
  return <Shell {...props}><CaseStudiesContent {...props} /></Shell>
}
