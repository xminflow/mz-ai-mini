import type { SiteTemplatePageProps } from '../../../types'
import { CaseDetailPage } from './CaseDetailPage'
import '../theme.css'

export default function CaseProjectPage(props: SiteTemplatePageProps) {
  return <CaseDetailPage {...props} slug="ai-project-management-automation-for-creative-teams" />
}
