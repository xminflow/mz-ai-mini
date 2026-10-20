import type { SiteTemplatePageProps } from '../../../types'
import { ProjectView } from '../components/Views'
import '../theme.css'
export default function ProjectPage(props: SiteTemplatePageProps & { projectId: string }) { return <ProjectView {...props} /> }
