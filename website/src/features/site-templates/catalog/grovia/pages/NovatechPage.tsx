import type { SiteTemplatePageProps } from '../../../types'
import { CaseView } from '../components/ContentViews'

export default function NovatechPage(props: SiteTemplatePageProps) {
  return <CaseView {...props} slug="novatech" />
}
