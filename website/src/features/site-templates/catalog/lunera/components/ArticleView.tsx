import { getTranslator } from '../messages'
import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import { asset, type LuneraArticle } from '../data'
import { Reveal } from './Motion'
import { LuneraShell } from './Shared'
import '../theme.css'

export function ArticleView({ basePath, locale = 'zh', article }: SiteTemplatePageProps & { article: LuneraArticle }) {
  const t = getTranslator(locale)
  return <LuneraShell basePath={basePath} locale={locale}><article className="ln-article">
    <Reveal><nav className="ln-breadcrumb" aria-label={t("面包屑导航")}><Link href={`${basePath}/blog`}>{t("博客")}</Link><span aria-hidden="true">/</span><span aria-current="page">{article.title}</span></nav><h1>{article.title}</h1>
      <div className="ln-article-meta"><div className="ln-author"><img src={asset(article.avatar)} alt={article.author} width="42" height="42" /><div><strong>{article.author}</strong><p>{article.role}</p></div></div><time dateTime={article.dateTime}>{article.date}</time></div>
      <img className="ln-article-cover" src={asset(article.image)} alt={article.imageAlt} width="1200" height="700" fetchPriority="high" />
    </Reveal>
    <div className="ln-article-body">{article.sections.map(section => <Reveal key={section.heading}><section><h2>{section.heading}</h2><p>{section.text}</p></section></Reveal>)}</div>
    <Link className="ln-article-back" href={`${basePath}/blog`}>{t("← 返回文章列表")}</Link>
  </article></LuneraShell>
}
