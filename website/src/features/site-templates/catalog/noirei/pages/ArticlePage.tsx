import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { SiteTemplatePageProps } from '../../../types'
import { articles, categoryLabels, formatDate, photos, pick, t } from '../data'
import { PageHero, SectionTitle, Shell } from '../components/Shell'
import { JournalCard } from '../components/collections'

export default function ArticlePage({ basePath, locale = 'zh', slug }: SiteTemplatePageProps & { slug: string }) {
  const article = articles.find(item => item.slug === slug)
  if (!article) notFound()
  return <Shell basePath={basePath} locale={locale}><PageHero article label={pick(locale, categoryLabels[article.category])} title={pick(locale, article.name)} description={pick(locale, article.intro)}><div className="nr-article-byline"><span>{article.author} · {pick(locale, article.role)}</span><span>{formatDate(article.date, locale)} · {article.minutes} {t(locale, '分钟阅读', 'min read')}</span></div></PageHero><figure className="nr-container nr-article-cover"><img src={photos(`/journal/${slug}`, 1)[0]} alt={pick(locale, article.name)} fetchPriority="high" /></figure><article className="nr-article-body nr-prose">{article.sections.map(section => <section key={section.title[1]}><h2>{pick(locale, section.title)}</h2>{section.paragraphs.map(paragraph => <p key={paragraph[1]}>{pick(locale, paragraph)}</p>)}</section>)}<p className="nr-fine">{t(locale, '湖畔故事为模板演示改写内容，人物与场景仅用于展示。', 'This adapted story and its characters illustrate the template experience.')}</p><Link className="nr-text-link" href={`${basePath}/journal`}>← {t(locale, '返回湖畔日志', 'Back to the journal')}</Link></article><section className="nr-light nr-section"><div className="nr-container"><SectionTitle label={t(locale, '继续阅读', 'Keep reading')} title={t(locale, '再翻开 一页湖畔生活', 'One more story before you go')} /><div className="nr-three-grid">{articles.filter(item => item.slug !== slug).slice(0, 3).map(item => <JournalCard key={item.slug} article={item} basePath={basePath} locale={locale} />)}</div></div></section></Shell>
}
