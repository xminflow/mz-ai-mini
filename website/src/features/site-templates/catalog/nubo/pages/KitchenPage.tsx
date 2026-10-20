import type { SiteTemplatePageProps } from '../../../types'
import { RoomView } from '../components/ContentViews'

export default function KitchenPage(props: SiteTemplatePageProps) {
  return <RoomView {...props} slug="kitchen" />
}
