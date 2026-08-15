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
   * 用 import() 缩略函数而非直接引用组件：Next.js 能静态分析这种写法做代码分割。
   * 意图是让每套模板独立分包，模板数量增长时不互相拖累首屏体积——但这只是设计意图，
   * 尚未在生产构建产物里验证过（dev 模式的加载策略与生产 chunk 划分不是一回事）。
   * 详见 README「已知遗留」。
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
  /**
   * 所属场景，取值必须是 taxonomy.ts 里定义的 scene id，注册表会校验。
   * 它决定模板出现在案例页的哪个分类下。
   *
   * 这里刻意不再保留独立的 industry 字段：sceneId 已经表达了「这是什么类型的项目」，
   * 再留一条近似的行业轴会让新增模板的人不知道该往哪填，行业信息一律进 tags。
   */
  sceneId: string
  /** 风格与行业标签，卡片上平铺展示 */
  tags: string[]
  summary: string
  /** 主色，列表页用一个色点标识 */
  accentColor: string
  /** 封面图路径，位于 public/templates/<id>/ 下 */
  cover: string
  pages: SiteTemplatePage[]
}
