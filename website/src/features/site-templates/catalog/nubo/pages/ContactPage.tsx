import type { SiteTemplatePageProps } from '../../../types'
import { ContentView } from '../components/ContentViews'

export default function ContactPage(props: SiteTemplatePageProps) {
  return <ContentView {...props} kind="contact" />
}
