import type { SiteTemplatePageProps } from '../../../types'
import { getContent } from '../content'
import { getTranslator } from '../messages'
import { LegalView } from '../components/LegalView'

export default function PrivacyPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  const { privacySections } = getContent(locale)
  const t = getTranslator(locale)
  return <LegalView basePath={basePath} locale={locale} title={t("隐私政策")} type="privacy-policy" sections={privacySections} />
}
