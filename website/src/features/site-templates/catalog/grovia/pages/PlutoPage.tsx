import type { SiteTemplatePageProps } from '../../../types'
import { CaseView } from '../components/ContentViews'

export default function PlutoPage(props: SiteTemplatePageProps) {
  return <CaseView {...props} slug="pluto" />
}
