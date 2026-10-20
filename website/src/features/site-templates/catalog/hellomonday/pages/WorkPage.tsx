import { Suspense } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { WorkRoute } from '../components/Views'
import '../theme.css'
export default function WorkPage(props: SiteTemplatePageProps) { return <Shell {...props}><Suspense fallback={<p className="hm-section">{props.locale==='en'?'Loading projects…':'正在读取作品…'}</p>}><WorkRoute basePath={props.basePath} /></Suspense></Shell> }
