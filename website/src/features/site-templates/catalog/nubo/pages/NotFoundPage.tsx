import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function NotFoundPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="404" />
}
