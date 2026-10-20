import type { SiteTemplatePageProps } from '../../../types'
import { CaseView } from '../components/ContentViews'

export default function LumoraPage(props: SiteTemplatePageProps) {
  return <CaseView {...props} slug="lumora" />
}
