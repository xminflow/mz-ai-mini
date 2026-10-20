import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { Policy } from '../components/Views'
import '../theme.css'
export default function PolicyPage(props: SiteTemplatePageProps & { kind:'privacy'|'terms' }) { return <Shell {...props}><Policy kind={props.kind} /></Shell> }
