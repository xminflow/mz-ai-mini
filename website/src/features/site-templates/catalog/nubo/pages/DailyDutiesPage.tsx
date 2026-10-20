import type { SiteTemplatePageProps } from '../../../types'
import { RoomView } from '../components/ContentViews'

export default function DailyDutiesPage(props: SiteTemplatePageProps) {
  return <RoomView {...props} slug="daily-duties" />
}
