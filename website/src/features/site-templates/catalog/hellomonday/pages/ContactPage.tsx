import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { Contact } from '../components/Views'
import '../theme.css'
export default function ContactPage(props: SiteTemplatePageProps & { kind?: 'project'|'career'|'internship' }) { return <Shell {...props}><Contact kind={props.kind} /></Shell> }
