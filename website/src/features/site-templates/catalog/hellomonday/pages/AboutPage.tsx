import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { About } from '../components/Views'
import '../theme.css'
export default function AboutPage(props: SiteTemplatePageProps) { return <Shell {...props}><About basePath={props.basePath} /></Shell> }
