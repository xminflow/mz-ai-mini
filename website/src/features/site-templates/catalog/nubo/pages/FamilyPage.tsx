import type { SiteTemplatePageProps } from '../../../types'
import { RoomView } from '../components/ContentViews'

export default function FamilyPage(props: SiteTemplatePageProps) {
  return <RoomView {...props} slug="family" />
}
