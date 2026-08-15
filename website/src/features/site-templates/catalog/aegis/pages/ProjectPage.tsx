import type { SiteTemplatePageProps } from '../../../types'
import { ProjectMonitorView } from '../components/ProjectMonitorView'
import '../theme.css'

/**
 * 项目监控详情页只是一层服务端外壳：真正的内容在 ProjectMonitorView 里，
 * 因为项目要能在页面上真实切换，那部分必须是客户端组件。
 * 其余四个页面仍然是纯服务端组件。
 */
export default function ProjectPage({ basePath }: SiteTemplatePageProps) {
  return <ProjectMonitorView basePath={basePath} />
}
