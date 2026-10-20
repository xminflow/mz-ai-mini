import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function CasesPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="cases" />
}
