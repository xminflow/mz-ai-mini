import type { SiteTemplatePageProps } from '../../../types'
import { RoomView } from '../components/ContentViews'

export default function HousekeepingPage(props: SiteTemplatePageProps) {
  return <RoomView {...props} slug="housekeeping" />
}
