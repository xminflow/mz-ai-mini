import type { SiteTemplatePageProps } from '../../../types'
import LegalPage from './LegalPage'
import '../theme.css'

export default function PrivacyPage(props: SiteTemplatePageProps) {
  return <LegalPage {...props} kind="privacy" />
}
