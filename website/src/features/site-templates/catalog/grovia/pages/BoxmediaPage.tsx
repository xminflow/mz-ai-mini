import type { SiteTemplatePageProps } from '../../../types'
import { CaseView } from '../components/ContentViews'

export default function BoxmediaPage(props: SiteTemplatePageProps) {
  return <CaseView {...props} slug="boxmedia" />
}
