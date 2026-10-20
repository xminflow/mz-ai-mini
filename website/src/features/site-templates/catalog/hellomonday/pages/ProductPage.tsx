import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shared'
import { Product } from '../components/Views'
import '../theme.css'
export default function ProductPage(props: SiteTemplatePageProps) { return <Shell {...props} dark><Product basePath={props.basePath} /></Shell> }
