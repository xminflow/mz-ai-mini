import { getTranslator } from '../messages'
import type { SiteTemplatePageProps } from '../../../types'
import { getContent } from '../content'
import { ArticleCards, LuneraShell, SectionHeading } from '../components/Shared'
import '../theme.css'

export default function BlogPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  const t = getTranslator(locale)
  const { articles } = getContent(locale)
  return <LuneraShell basePath={basePath} locale={locale}><div className="ln-blog-page ln-container"><SectionHeading level={1} badge={t("博客")} title={t("让每一笔支出，更有章法。")} description={t("分享财务管理、产品设计与创业日常的思考，为你的下一步带来启发。")} /><ArticleCards basePath={basePath} posts={articles} /></div></LuneraShell>
}
