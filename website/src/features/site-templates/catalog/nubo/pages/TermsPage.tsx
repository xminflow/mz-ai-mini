import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function TermsPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="terms" />
}
