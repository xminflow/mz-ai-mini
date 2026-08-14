import type { ComponentType } from 'react'

export interface SiteTemplatePageProps {
  /**
   * 模板站点在当前挂载点下的根路径，如 `/templates/meridian`。
   *
   * 模板内部所有站内链接都必须基于它拼接，禁止硬编码 `/templates` 前缀——
   * 将来模板换挂载点（独立域名、上架后的预览页）时才不用逐套改。
   */
  basePath: string
}

/** 模板内的单个页面。slug 为空串代表模板首页。 */
export interface SiteTemplatePage {
  slug: string
  title: string
  /**
   * 用 import() 缩略函数而非直接引用组件：Next.js 能静态分析这种写法，
   * 为每套模板独立分包，模板数量增长时不会互相拖累首屏体积。
   */
  load: () => Promise<{ default: ComponentType<SiteTemplatePageProps> }>
}

/**
 * 模板元数据。字段按「将来上架的模板列表页需要什么」来定，
 * 而不是按「现在开发调试需要什么」——上架时不该再改一遍数据结构。
 */
export interface SiteTemplate {
  id: string
  name: string
  /** 适用行业，列表页展示与将来的筛选维度 */
  industry: string
  /** 风格标签，将来的筛选维度 */
  tags: string[]
  summary: string
  /** 主色，列表页用一个色点标识 */
  accentColor: string
  /** 封面图路径，位于 public/templates/<id>/ 下 */
  cover: string
  pages: SiteTemplatePage[]
}
