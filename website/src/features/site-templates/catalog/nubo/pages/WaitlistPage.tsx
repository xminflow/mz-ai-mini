import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function WaitlistPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="waitlist" />
}
