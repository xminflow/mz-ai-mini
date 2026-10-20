import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function PrivacyPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="privacy" />
}
