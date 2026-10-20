import type { SiteTemplatePageProps } from '../../../types'
import { HomeView } from '../components/HomeView'

export default function HomePage(props: SiteTemplatePageProps) {
  return <HomeView {...props} />
}
