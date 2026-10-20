import type { SiteTemplatePageProps } from '../../../types'
import { PolicyView } from '../components/Views'
import '../theme.css'
export default function TermsPage(props: SiteTemplatePageProps) { return <PolicyView {...props} kind="terms" /> }
