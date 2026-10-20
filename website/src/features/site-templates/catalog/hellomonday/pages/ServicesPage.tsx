import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { Services } from '../components/Views'
import '../theme.css'
export default function ServicesPage(props: SiteTemplatePageProps) { return <Shell {...props}><Services basePath={props.basePath} /></Shell> }
