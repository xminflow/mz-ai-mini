import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { Story } from '../components/Views'
import '../theme.css'
export default function StoryPage(props: SiteTemplatePageProps & { storyId: string }) { return <Shell {...props}><Story basePath={props.basePath} id={props.storyId} /></Shell> }
