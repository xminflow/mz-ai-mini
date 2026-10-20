import type { SiteTemplatePageProps } from '../../../types'
import { CaseDetailPage } from './CaseDetailPage'
import '../theme.css'

export default function CasePropertyPage(props: SiteTemplatePageProps) {
  return <CaseDetailPage {...props} slug="ai-property-inquiry-chatbot-for-real-estate-firms" />
}
