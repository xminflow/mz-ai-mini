import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function AboutPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="about" />
}
