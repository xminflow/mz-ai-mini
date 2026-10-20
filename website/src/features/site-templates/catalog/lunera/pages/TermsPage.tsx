import type { SiteTemplatePageProps } from '../../../types'
import { getContent } from '../content'
import { getTranslator } from '../messages'
import { LegalView } from '../components/LegalView'

export default function TermsPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  const { termsSections } = getContent(locale)
  const t = getTranslator(locale)
  return <LegalView basePath={basePath} locale={locale} title={t("服务条款")} type="terms-and-conditions" sections={termsSections} />
}
