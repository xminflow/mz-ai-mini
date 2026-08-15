import type { ComponentType } from 'react'

export interface SiteTemplatePageProps {
  /**
   * 该端在当前挂载点下的根路径，如 `/templates/aegis/console`。
   *
   * 模板内部所有站内链接都必须基于它拼接，禁止硬编码 `/templates` 前缀——
   * 将来模板换挂载点（独立域名、上架后的预览页）时才不用逐套改。
   */
  basePath: string
}

/** 一个端内的单个页面。slug 为空串代表该端的首页。 */
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
 * 端跑在什么设备形态上。与场景分类正交：场景回答「做的是什么」，这里回答「在哪儿用」。
 *
 * 挂在端上而不是模板上：一套交付常常同时包含 PC 端的管理后台与小程序端的商城，
 * 挂在模板级就表达不了这种组合。
 */
export type TemplatePlatform = 'pc' | 'miniprogram' | 'mobile'

/** 端类型的中文展示名，卡片上直接用。 */
export const TEMPLATE_PLATFORM_LABELS: Record<TemplatePlatform, string> = {
  pc: 'PC 端',
  miniprogram: '小程序',
  mobile: '手机端',
}

/**
 * 一套交付里的一个独立站点。
 *
 * 这一层是必要的而不是过度设计：真实项目很少只有一个站——企业官网通常配一个管理后台，
 * 商城小程序背后还有一套订单后台。它们页面集完全不同、设计语言往往也不同，
 * 硬塞进同一个扁平的 pages 数组，客户在预览里会看到官网和后台的页面混在一排。
 */
export interface TemplateSurface {
  /** kebab-case，URL 片段：`/templates/<模板 id>/<端 id>/<页面 slug>` */
  id: string
  /** 展示名，如「官网」「管理后台」「商城小程序」 */
  name: string
  platform: TemplatePlatform
  /** 该端的页面，必须含一个 slug 为空串的首页 */
  pages: SiteTemplatePage[]
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
  /**
   * 是否已上架到对外的案例页 `/cases`。
   *
   * 刻意做成必填而不是可选：上架意味着这套模板要被客户看到，必须是一次明确的点头，
   * 不能是「新建模板时忘了写」的默认结果。内部工作台 `/templates` 不看这个字段，
   * 始终全量显示——它是调试入口，收录进注册表与对外展示是两件事。
   */
  listed: boolean
  /** 风格与行业标签，卡片上平铺展示 */
  tags: string[]
  summary: string
  /** 主色，列表页用一个色点标识 */
  accentColor: string
  /** 封面图路径，位于 public/templates/<id>/ 下 */
  cover: string
  /** 这套交付包含的端，数组顺序即预览页的端切换顺序，第一个是默认端 */
  surfaces: TemplateSurface[]
}
