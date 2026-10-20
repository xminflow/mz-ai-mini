/**
 * 首页「我们的维保优势」板块的截图清单。
 *
 * 图片是自研维保平台真实页面的静态导出，不是示意图。之所以走静态图而不是把平台页面
 * 嵌进来实时渲染：平台在站内的路由挂在带开关的工作台之下（noindex，且随时可能关掉），
 * 首页作为对外主入口不能依赖那条路径的存在。
 *
 * 顺序即标签自左向右的顺序，数组第一项是默认展示的那一张。
 */
export interface OpsScreen {
  id: 'overview' | 'inspect' | 'alerts' | 'logs'
  /** 收起条上的名字，与平台内的页面名保持一致，避免官网自造一套叫法 */
  label: string
  src: string
  alt: string
}

/**
 * 截图的逻辑尺寸，用来锁舞台的宽高比与 <img> 的固有比例。
 *
 * 四张统一按 1450×900 的视口、2 倍像素导出（文件是 2900×1800，缩到主屏尺寸时更锐）。
 * 视口取 1450 而不是 1440，是为了让控制台减去 10px 页面滚动条之后正好剩 1440 的内容宽。
 * 比例必须四张一致：舞台高度按它算死，换图若换了比例，主屏会被拉伸，队列各档也要重排。
 */
export const OPS_SHOT_WIDTH = 1450
export const OPS_SHOT_HEIGHT = 900

/**
 * 屏幕外圈的装裱色，取自模板自己的 --tpl-bg-elev。
 *
 * 截图底色是 #070b12，这里比它亮一档：图的四周因此多出一道极细的亮边，
 * 深色画面不再是硬切在浅色纸面上。直接用白色裱会让两种色温正面相撞，
 * 那正是这一节最早读起来生硬的原因。
 */
export const OPS_SHOT_FRAME = '#0d121c'

export const OPS_SCREENS: OpsScreen[] = [
  {
    id: 'overview',
    label: '项目总览',
    src: '/home/ops/overview.webp',
    alt: '微域 AI 维保平台的项目总览页面：在线项目数、活跃告警、可用性与全局告警趋势',
  },
  {
    id: 'inspect',
    label: '智能体巡检',
    src: '/home/ops/inspect.webp',
    alt: '微域 AI 维保平台的智能体巡检页面：多个巡检智能体分工扫描，逐条输出发现与处置',
  },
  {
    id: 'alerts',
    label: '告警中心',
    src: '/home/ops/alerts.webp',
    alt: '微域 AI 维保平台的告警中心页面：告警严重度构成、确认与恢复时长、单条告警的处理时间线',
  },
  {
    id: 'logs',
    label: '日志与异常',
    src: '/home/ops/logs.webp',
    alt: '微域 AI 维保平台的日志与异常页面：日志分级总量、异常趋势与按错误签名归一的异常聚类',
  },
]
