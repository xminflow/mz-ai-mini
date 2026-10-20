/**
 * 作品数据。全部为演示用的编造内容，配图为真实照片。
 *
 * 照片来自 Pexels（Pexels License，可免费商用、无需署名），已下载到
 * `public/templates/liubai/photos/` 本地托管。刻意不外链 images.pexels.com：
 * 外链会让模板依赖第三方站点可用性，也会绕过本地缓存拖慢预览。
 *
 * 图源对照（pexels.com/photo/<id>），将来要换图或核对授权时按这张表查：
 *   hero 36057215 · studio 18022171
 *   chaoxi 5706015 · shiguang 12024969 · jianshan 256559
 *   zhiliao 7190944 · fangtang 18096282 · qimu 3585000
 *   baijing 3850239 · yuntu 54284 · mingri 6804422
 *   yiwei 10779517 · sanri 33733875 · bailu 4464884
 */

/** 作品图目录。**文件名与 Work.id 一一对应**，新增作品时按同名放图即可。 */
const PHOTO_DIR = '/templates/liubai/photos'

export function workPhoto(workId: string): string {
  return `${PHOTO_DIR}/${workId}.jpg`
}

/** 非作品的通用配图。 */
export const SITE_PHOTOS = {
  /** 首屏：与参考站一致，用一张人像撑住画面右半边 */
  hero: `${PHOTO_DIR}/hero.jpg`,
  studio: `${PHOTO_DIR}/studio.jpg`,
} as const

/** 作品类型。数组顺序即作品页的分组顺序。 */
export type WorkCategory = 'brand' | 'website' | 'product' | 'print'

export interface WorkCategorySpec {
  id: WorkCategory
  label: string
  /** 分组标题右侧的一句话，交代这一类项目的工作重心 */
  note: string
}

export const WORK_CATEGORIES: WorkCategorySpec[] = [
  { id: 'brand', label: '品牌设计', note: '从命名与定位入手，先想清楚说什么，再决定怎么看' },
  { id: 'website', label: '网站设计', note: '设计与前端同一支队伍做，线上效果与设计稿一致' },
  { id: 'product', label: '产品设计', note: '按真实使用流程排布，先解决动线再谈界面风格' },
  { id: 'print', label: '平面与包装', note: '落到实物上验证：印刷、材质、工艺都要过一遍打样' },
]

export interface Work {
  id: string
  /** 展示名，含项目类型后缀 */
  name: string
  /** 客户名，作品页的元信息里单列一项 */
  client: string
  category: WorkCategory
  year: number
  /** 这个项目交付了什么，用 · 分隔 */
  scope: string
  /** 作品卡上的一句话，说清这个项目解决的是什么问题 */
  brief: string
  tags: string[]
  /**
   * 线稿变体索引，目前只有服务区插图在用，作品卡一律走实拍照。
   * 保留这个字段是为了将来某个区块要用示意图时不必再补一遍数据。
   */
  sketch: number
}

export const WORKS: Work[] = [
  {
    id: 'chaoxi',
    name: '潮汐笔记 品牌重塑',
    client: '潮汐笔记',
    category: 'brand',
    year: 2025,
    scope: '品牌识别 · 视觉规范 · 官网',
    brief: '把一个功能列表式的产品，重新讲成「专注」这一件事。标志、字体与语气一起换掉。',
    tags: ['品牌重塑', '视觉规范', 'SaaS'],
    sketch: 0,
  },
  {
    id: 'shiguang',
    name: '拾光咖啡 品牌识别',
    client: '拾光咖啡',
    category: 'brand',
    year: 2024,
    scope: '命名 · 标志 · 门店应用',
    brief: '六家门店此前各做各的招牌。这次把标志、杯型、菜单与灯箱收进同一套规范里。',
    tags: ['连锁餐饮', '门店应用', '手册'],
    sketch: 1,
  },
  {
    id: 'jianshan',
    name: '见山文化 品牌手册',
    client: '见山文化',
    category: 'brand',
    year: 2023,
    scope: '视觉系统 · 图形库 · 手册',
    brief: '一家出版机构的识别系统。图形来自版心与栏宽，不额外造型，规范本身就是内容。',
    tags: ['出版', '图形系统', '规范'],
    sketch: 2,
  },
  {
    id: 'zhiliao',
    name: '知了科技 官网重做',
    client: '知了科技',
    category: 'website',
    year: 2025,
    scope: '信息架构 · 设计 · 前端',
    brief: '把七个入口砍成三个。首屏只讲一件事，转化路径从四步缩到两步。',
    tags: ['B2B', '信息架构', 'Next.js'],
    sketch: 5,
  },
  {
    id: 'fangtang',
    name: '方糖科技 产品官网',
    client: '方糖科技',
    category: 'website',
    year: 2024,
    scope: '设计 · 前端 · CMS',
    brief: '带内容管理的产品站。市场同学自己就能改文案与配图，不用每次找我们排期。',
    tags: ['产品站', 'CMS', 'Framer'],
    sketch: 6,
  },
  {
    id: 'qimu',
    name: '栖木家居 电商官网',
    client: '栖木家居',
    category: 'website',
    year: 2023,
    scope: '设计 · 前端 · 图片规范',
    brief: '家具电商最难的是图。我们同时交了一套拍摄与裁切规范，新品上架不再各拍各的。',
    tags: ['电商', '图片规范', '响应式'],
    sketch: 3,
  },
  {
    id: 'baijing',
    name: '白鲸出行 App 界面',
    client: '白鲸出行',
    category: 'product',
    year: 2025,
    scope: '流程设计 · 界面 · 组件库',
    brief: '下单流程从五屏压到三屏，同时把组件抽成一套库，之后的新功能不用再重画。',
    tags: ['App', '组件库', '流程优化'],
    sketch: 10,
  },
  {
    id: 'yuntu',
    name: '云图协作 后台系统',
    client: '云图协作',
    category: 'product',
    year: 2024,
    scope: '设计系统 · 界面 · 交付规范',
    brief: '两百多个后台页面，先做一套设计系统再画页面。工程按令牌实现，还原度不用再对。',
    tags: ['后台', '设计系统', '设计令牌'],
    sketch: 7,
  },
  {
    id: 'mingri',
    name: '明日学院 学习端',
    client: '明日学院',
    category: 'product',
    year: 2022,
    scope: '用户调研 · 界面 · 可用性测试',
    brief: '课程页跳出率过半。跟着十二位真实用户走完一遍，把目录、进度与笔记重排了一次。',
    tags: ['在线教育', '可用性', '调研'],
    sketch: 4,
  },
  {
    id: 'yiwei',
    name: '一味茶 包装系统',
    client: '一味茶',
    category: 'print',
    year: 2024,
    scope: '包装 · 材质工艺 · 礼盒',
    brief: '十二个品类共用一套版式，只换色与字。上新不必重新设计，打样一轮就能定。',
    tags: ['包装', '礼盒', '工艺'],
    sketch: 11,
  },
  {
    id: 'sanri',
    name: '三日书店 导视系统',
    client: '三日书店',
    category: 'print',
    year: 2023,
    scope: '导视 · 图形 · 施工图',
    brief: '书店最怕找不到书。分类牌、层架标与地面指引出自同一套图形逻辑，进门就知道往哪走。',
    tags: ['导视', '空间图形', '施工图'],
    sketch: 8,
  },
  {
    id: 'bailu',
    name: '白露酒造 酒标与礼盒',
    client: '白露酒造',
    category: 'print',
    year: 2022,
    scope: '酒标 · 礼盒 · 印刷跟场',
    brief: '烫金压凹试了七版打样才定。最终方案在两千元与两百元的产品线上都成立。',
    tags: ['酒标', '烫金', '打样'],
    sketch: 9,
  },
]

/** 首页精选：取六个，覆盖四种类型，与参考站的 Selected work 数量一致。 */
export const FEATURED_WORK_IDS = [
  'chaoxi',
  'zhiliao',
  'baijing',
  'yiwei',
  'shiguang',
  'yuntu',
]

export const FEATURED_WORKS: Work[] = FEATURED_WORK_IDS.map((id) => {
  const work = WORKS.find((item) => item.id === id)
  // 精选清单是手写的 id 列表，写错一个在页面上只会静默少一张卡，必须当场炸出来
  if (!work) throw new Error(`[liubai] FEATURED_WORK_IDS 里的「${id}」不存在于 WORKS`)
  return work
})

/** 按类型分组，顺序跟随 WORK_CATEGORIES。作品页做静态分组陈列，不做筛选交互。 */
export function groupWorksByCategory(): { spec: WorkCategorySpec; works: Work[] }[] {
  return WORK_CATEGORIES.map((spec) => ({
    spec,
    works: WORKS.filter((work) => work.category === spec.id),
  }))
}

export function getCategoryLabel(category: WorkCategory): string {
  const spec = WORK_CATEGORIES.find((item) => item.id === category)
  if (!spec) throw new Error(`[liubai] 未知的作品类型：${category}`)
  return spec.label
}
