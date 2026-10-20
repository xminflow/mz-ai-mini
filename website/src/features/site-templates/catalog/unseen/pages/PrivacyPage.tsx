import type { SiteTemplatePageProps } from '../../../types'
import { PolicyView } from '../components/Views'
import '../theme.css'
export default function PrivacyPage(props: SiteTemplatePageProps) { return <PolicyView {...props} kind="privacy" /> }
