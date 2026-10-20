import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function UpdatesPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="updates" />
}
