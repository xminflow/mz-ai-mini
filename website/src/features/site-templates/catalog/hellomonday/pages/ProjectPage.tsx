import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { ProjectView } from '../components/ProjectView'
import '../theme.css'
export default function ProjectPage(props: SiteTemplatePageProps & { projectId: string }) { return <Shell {...props}><ProjectView basePath={props.basePath} id={props.projectId} /></Shell> }
