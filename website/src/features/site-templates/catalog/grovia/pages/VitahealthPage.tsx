import type { SiteTemplatePageProps } from '../../../types'
import { CaseView } from '../components/ContentViews'

export default function VitahealthPage(props: SiteTemplatePageProps) {
  return <CaseView {...props} slug="vitahealth" />
}
