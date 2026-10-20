import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { Stories } from '../components/Views'
import '../theme.css'
export default function StoriesPage(props: SiteTemplatePageProps) { return <Shell {...props}><Stories basePath={props.basePath} /></Shell> }
