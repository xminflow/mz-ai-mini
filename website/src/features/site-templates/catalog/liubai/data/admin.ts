/**
 * 管理后台的演示数据。全部写死为字面量。
 *
 * 禁止 Math.random() / Date.now() / new Date()：同一份数据服务端与客户端各算一次，
 * 取值不确定会直接导致 hydration 报错。要"看起来是真实运营中的站"，靠的是把数字编得合理，
 * 而不是让它每次刷新都变。
 */

export const ADMIN_USER = {
  name: '苏澜',
  initial: '苏',
  role: '管理员',
} as const

/** 概览页顶部的四个数字。delta 是与上月的对比，正负号直接写在字符串里。 */
export const ADMIN_KPIS = [
  { label: '待处理咨询', value: '6', unit: '条', delta: '+2', tone: 'warn' as const },
  { label: '进行中项目', value: '5', unit: '个', delta: '持平', tone: 'plain' as const },
  { label: '已发布作品', value: '30', unit: '篇', delta: '+2', tone: 'ok' as const },
  { label: '本月官网访问', value: '4,207', unit: '次', delta: '+23%', tone: 'ok' as const },
]

/** 近七天咨询量。用纯 CSS 条形呈现，不引图表库——四根到十根柱子的场景不值得加一个依赖。 */
export const INQUIRY_TREND = [
  { day: '周一', count: 4 },
  { day: '周二', count: 6 },
  { day: '周三', count: 3 },
  { day: '周四', count: 8 },
  { day: '周五', count: 7 },
  { day: '周六', count: 2 },
  { day: '周日', count: 1 },
]

export const INQUIRY_TREND_MAX = Math.max(...INQUIRY_TREND.map((item) => item.count))

/** 咨询线索的处理状态。 */
export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'closed'

export const LEAD_STATUS_LABEL: Record<
  LeadStatus,
  { label: string; tone: 'warn' | 'accent' | 'ok' | 'plain' }
> = {
  new: { label: '待联系', tone: 'warn' },
  contacted: { label: '已沟通', tone: 'accent' },
  quoted: { label: '已报价', tone: 'ok' },
  closed: { label: '已关闭', tone: 'plain' },
}

export interface Lead {
  id: string
  name: string
  phone: string
  company: string
  /** 想做什么：品牌 / 网站 / 产品界面 / 平面 */
  category: string
  budget: string
  source: string
  status: LeadStatus
  submittedAt: string
  note: string
}

export const LEADS: Lead[] = [
  {
    id: 'L-2058',
    name: '周宇',
    phone: '138****4102',
    company: '半山健康',
    category: '品牌 + 网站',
    budget: '15–25 万',
    source: '官网表单',
    status: 'new',
    submittedAt: '08-15 21:36',
    note: '刚拿到 A 轮，现有 VI 是外包做的，想整体重来一遍。希望年内上线。',
  },
  {
    id: 'L-2057',
    name: '陈屿',
    phone: '139****7781',
    company: '潮汐笔记',
    category: '产品界面',
    budget: '面议',
    source: '老客户',
    status: 'contacted',
    submittedAt: '08-15 15:02',
    note: '要做桌面端，沿用现有设计系统，问能不能直接复用组件库。',
  },
  {
    id: 'L-2056',
    name: '李澄',
    phone: '186****3390',
    company: '青野食品',
    category: '包装',
    budget: '5–10 万',
    source: '官网表单',
    status: 'new',
    submittedAt: '08-15 10:47',
    note: '八个 SKU 的包装重做，希望共用一套版式，只换色与口味名。',
  },
  {
    id: 'L-2055',
    name: '吴迪',
    phone: '135****2264',
    company: '南山科技',
    category: '网站',
    budget: '10–15 万',
    source: '设计平台',
    status: 'quoted',
    submittedAt: '08-14 17:20',
    note: '产品站带 CMS，市场同学要能自己改。已发报价，等对方内部走流程。',
  },
  {
    id: 'L-2054',
    name: '何岸',
    phone: '137****9015',
    company: '栖云文旅',
    category: '品牌',
    budget: '面议',
    source: '老客户推荐',
    status: 'contacted',
    submittedAt: '08-13 09:58',
    note: '新品牌线，需要命名 + 标志 + 一本手册。明年三月首店开业。',
  },
  {
    id: 'L-2053',
    name: '郭婷',
    phone: '158****6642',
    company: '明日学院',
    category: '产品界面',
    budget: '8–12 万',
    source: '官网表单',
    status: 'new',
    submittedAt: '08-12 22:14',
    note: '学习端二期，主要问题是课程目录太深，用户找不到自己学到哪了。',
  },
  {
    id: 'L-2052',
    name: '方骏',
    phone: '133****5518',
    company: '一味茶',
    category: '网站',
    budget: '3–5 万',
    source: '官网表单',
    status: 'closed',
    submittedAt: '08-09 14:31',
    note: '预算与范围对不上，已婉拒并推荐了两家更合适的同行。',
  },
]

/** 作品内容的发布状态。 */
export type WorkPublishStatus = 'published' | 'draft' | 'archived'

export const WORK_STATUS_LABEL: Record<
  WorkPublishStatus,
  { label: string; tone: 'ok' | 'warn' | 'plain' }
> = {
  published: { label: '已发布', tone: 'ok' },
  draft: { label: '草稿', tone: 'warn' },
  archived: { label: '已下架', tone: 'plain' },
}

export interface WorkRecord {
  /** 与 works.ts 的 Work.id 对应，后台管理的就是官网陈列的那批作品 */
  workId: string
  name: string
  category: string
  status: WorkPublishStatus
  /** 图片张数，编辑列表里最常被问的一个数 */
  photos: number
  views: number
  updatedAt: string
  /** 是否被选进首页精选 */
  featured: boolean
}

export const WORK_RECORDS: WorkRecord[] = [
  { workId: 'chaoxi', name: '潮汐笔记 品牌重塑', category: '品牌设计', status: 'published', photos: 24, views: 2418, updatedAt: '08-14', featured: true },
  { workId: 'zhiliao', name: '知了科技 官网重做', category: '网站设计', status: 'published', photos: 18, views: 1963, updatedAt: '08-11', featured: true },
  { workId: 'baijing', name: '白鲸出行 App 界面', category: '产品设计', status: 'published', photos: 31, views: 3140, updatedAt: '08-07', featured: true },
  { workId: 'yiwei', name: '一味茶 包装系统', category: '平面与包装', status: 'published', photos: 22, views: 1755, updatedAt: '07-30', featured: true },
  { workId: 'shiguang', name: '拾光咖啡 品牌识别', category: '品牌设计', status: 'published', photos: 26, views: 2087, updatedAt: '07-22', featured: true },
  { workId: 'yuntu', name: '云图协作 后台系统', category: '产品设计', status: 'published', photos: 19, views: 1204, updatedAt: '07-16', featured: true },
  { workId: 'fangtang', name: '方糖科技 产品官网', category: '网站设计', status: 'published', photos: 15, views: 942, updatedAt: '06-28', featured: false },
  { workId: 'jianshan', name: '见山文化 品牌手册', category: '品牌设计', status: 'published', photos: 28, views: 806, updatedAt: '06-09', featured: false },
  { workId: 'sanri', name: '三日书店 导视系统', category: '平面与包装', status: 'draft', photos: 9, views: 0, updatedAt: '08-15', featured: false },
  { workId: 'qimu', name: '栖木家居 电商官网', category: '网站设计', status: 'published', photos: 21, views: 688, updatedAt: '05-26', featured: false },
  { workId: 'mingri', name: '明日学院 学习端', category: '产品设计', status: 'archived', photos: 13, views: 402, updatedAt: '03-11', featured: false },
  { workId: 'bailu', name: '白露酒造 酒标与礼盒', category: '平面与包装', status: 'published', photos: 17, views: 1131, updatedAt: '04-02', featured: false },
]

/** 概览页的进行中项目。progress 是百分比整数。 */
export const ACTIVE_PROJECTS = [
  { name: '半山健康 品牌全案', stage: '方向探索', progress: 18, owner: '苏澜', due: '10-20' },
  { name: '潮汐笔记 桌面端', stage: '界面设计', progress: 54, owner: '林见月', due: '09-12' },
  { name: '南山科技 产品站', stage: '前端开发', progress: 76, owner: '郑禾', due: '09-02' },
  { name: '青野食品 包装', stage: '打样跟场', progress: 88, owner: '沈知白', due: '08-26' },
  { name: '栖云文旅 命名', stage: '交付整理', progress: 95, owner: '苏澜', due: '08-21' },
]

/** 站点设置页的分组。做成只读的视觉态，模板展示界面形态而不实现表单逻辑。 */
export const SITE_SETTINGS = [
  {
    group: '站点信息',
    items: [
      { label: '站点名称', value: '留白设计工作室', hint: '显示在浏览器标签与页脚' },
      { label: '站点标语', value: '更清楚的品牌，也更快落地', hint: '首页大标题，建议不超过 16 字' },
      { label: '备案号', value: '浙 ICP 备 17029xxx 号', hint: '显示在页脚，留空则不显示' },
    ],
  },
  {
    group: '联系方式',
    items: [
      { label: '咨询电话', value: '0571-8800 1663', hint: '显示在页头按钮与联系页' },
      { label: '邮箱', value: 'hello@liubai.studio', hint: '表单提交后同步抄送到这里' },
      { label: '工作室地址', value: '杭州市拱墅区丝联 166 创意产业园 3 号楼 2F', hint: '联系页地图定位使用' },
    ],
  },
  {
    group: '内容与展示',
    items: [
      { label: '首页精选数量', value: '6 个', hint: '按作品列表中标记为精选的顺序取前 N 个' },
      { label: '作品分组方式', value: '按项目类型', hint: '可选：按项目类型 / 按年份 / 手动排序' },
      { label: '常见问题', value: '已启用 · 8 条', hint: '关闭后首页与联系页均不显示该区块' },
    ],
  },
  {
    group: '表单与通知',
    items: [
      { label: '咨询表单', value: '已开启', hint: '关闭后联系页只展示邮箱与地址' },
      { label: '新咨询提醒', value: '短信 + 邮件', hint: '提醒发送至苏澜、沈知白' },
      { label: '自动回复', value: '已开启', hint: '提交后向访客发送一封确认邮件' },
    ],
  },
]
