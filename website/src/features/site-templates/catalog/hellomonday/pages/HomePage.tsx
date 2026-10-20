import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { Home } from '../components/Views'
import '../theme.css'
export default function HomePage(props: SiteTemplatePageProps) { return <Shell {...props}><Home basePath={props.basePath} /></Shell> }
