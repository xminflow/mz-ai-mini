import type { SiteTemplatePageProps } from '../../../types'
import { getContent } from '../content'
import { ArticleView } from '../components/ArticleView'

export default function UsersArticlePage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  const { articles } = getContent(locale)
  return <ArticleView basePath={basePath} locale={locale} article={articles[4]} />
}
