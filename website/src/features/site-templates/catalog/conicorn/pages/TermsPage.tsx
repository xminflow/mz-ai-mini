import type { SiteTemplatePageProps } from '../../../types'
import LegalPage from './LegalPage'
import '../theme.css'

export default function TermsPage(props: SiteTemplatePageProps) {
  return <LegalPage {...props} kind="terms" />
}
