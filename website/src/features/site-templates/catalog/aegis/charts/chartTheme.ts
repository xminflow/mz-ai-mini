import type { AlertSeverity } from '../data'

/**
 * 图表配色与轴样式常量（深色底口径）。
 *
 * 为什么是字面量十六进制而不是 var(--tpl-*)：echarts 用 canvas 渲染，
 * 拿不到 CSS 自定义属性，写 var() 会直接画不出颜色。因此这份常量必须与
 * theme.css 手工保持一致，改色时两处都要改。
 *
 * 深色配色不是把浅色翻转得来的，是按深色底重新选并逐项校验过的
 * （底色 #0d121c，OKLab ΔE + 二色觉模拟 + WCAG 对比度）：
 *   - 双序列  #38bdf8 / #e2e8f0  色觉 ΔE 16.1、正常 21.7、对比度 8.75 / 15.2
 *   - 严重度  #fb7185 / #fbbf24 / #38bdf8  最差相邻 ΔE 8.0、对比度 ≥ 6.9:1
 *   - 状态色  #34d399 / #fbbf24 / #fb7185  正常视觉最差 ΔE 21.2
 */

/** 图表画布的实底。玻璃是 CSS 的事，canvas 里只能用不透明色，取面板压出来的等效色 */
export const CHART_SURFACE = '#0d121c'
/** 网格线与轴线一律实线细发丝线，深色底上用低透明度白；虚线会被误读成阈值 */
export const CHART_GRID = 'rgba(148, 163, 184, 0.12)'
export const CHART_AXIS = 'rgba(148, 163, 184, 0.22)'
export const CHART_TEXT_DIM = '#93a4bd'
export const CHART_TEXT_FAINT = '#64758c'

export const ACCENT = '#38bdf8'

/** 状态语义色。仅当颜色真的表达「好/坏」时使用，不得挪作第 N 个分类序列色。 */
export const STATUS_COLORS = {
  ok: '#34d399',
  warn: '#fbbf24',
  crit: '#fb7185',
  info: '#38bdf8',
} as const

/**
 * 告警严重度 → 图表色。
 *
 * 单独立一张表而不是直接拿 STATUS_COLORS 去索引：STATUS_COLORS 的键是
 * ok/warn/crit（健康度口径），告警严重度的键是 critical/warning/info，
 * 两套命名只有 info 恰好重合，直接索引会静默取到 undefined，
 * 图表随即回落到 echarts 默认调色板——错得很像"能跑"。
 * 用 Record<AlertSeverity, string> 标注后，漏一个键就是编译错误。
 */
export const SEVERITY_CHART_COLORS: Record<AlertSeverity, string> = {
  critical: '#fb7185',
  warning: '#fbbf24',
  info: '#38bdf8',
}

/**
 * 分类序列固定顺序，永不循环、永不按排名重新分配。
 *
 * 只有两支，因为目前只有资源图用到（CPU / 内存）。第二支刻意是中性亮白：
 * 深色底上能与青蓝拉开最大距离，且不会被误读成任何状态色——
 * 换成绿/黄/红任何一支都会和状态语义打架，换成紫或青绿则在红绿色觉下与青蓝几乎同色
 * （实测 deutan ΔE 仅 4.9 与 4.6）。**加第三支之前必须重跑校验**。
 */
export const SERIES_COLORS = ['#38bdf8', '#e2e8f0'] as const

/**
 * 日志等级配色。DEBUG 刻意用低饱和灰蓝：它是「噪声/其它」槽位，
 * 校验会因此报 chroma floor，这是设计意图而非疏漏——
 * DEBUG 必须在图里退到背景，且它始终带图例直标，识别不依赖颜色。
 */
export const LOG_LEVEL_COLORS = {
  DEBUG: '#64758c',
  INFO: '#38bdf8',
  WARN: '#fbbf24',
  ERROR: '#fb7185',
} as const

const FONT_MONO = '"SF Mono", "JetBrains Mono", Consolas, monospace'

/** 轴刻度用等宽字体，保证数字纵向对齐。 */
export const AXIS_LABEL_STYLE = {
  color: CHART_TEXT_FAINT,
  fontSize: 10,
  fontFamily: FONT_MONO,
}

/** 类目轴（时间刻度）的统一样式：只留一条底轴线，不画竖向网格。 */
export function categoryAxis(data: readonly string[], interval = 3) {
  return {
    type: 'category' as const,
    data: [...data],
    boundaryGap: false,
    axisLine: { lineStyle: { color: CHART_AXIS } },
    axisTick: { show: false },
    axisLabel: { ...AXIS_LABEL_STYLE, interval },
  }
}

/** 数值轴：无轴线，只留横向发丝网格线。 */
export function valueAxis(overrides: Record<string, unknown> = {}) {
  return {
    type: 'value' as const,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: CHART_GRID, type: 'solid' as const } },
    axisLabel: AXIS_LABEL_STYLE,
    ...overrides,
  }
}

/** 坐标系内边距。bottom 必须给足，否则 x 轴刻度会被容器裁掉。 */
export const GRID = { left: 8, right: 12, top: 12, bottom: 4, containLabel: true }

/** 折线/面积图的十字准星提示层。深色底上提示框要比面板更实，否则读不清 */
export const AXIS_TOOLTIP = {
  trigger: 'axis' as const,
  axisPointer: { type: 'line' as const, lineStyle: { color: CHART_AXIS, width: 1 } },
  backgroundColor: 'rgba(13, 18, 28, 0.94)',
  borderColor: 'rgba(148, 163, 184, 0.28)',
  borderWidth: 1,
  padding: [8, 10] as [number, number],
  textStyle: { color: '#e6edf7', fontSize: 12 },
  extraCssText: 'box-shadow:0 8px 28px rgb(0 0 0 / 0.55);border-radius:8px;backdrop-filter:blur(8px);',
}

/** 柱/扇形等逐标记提示层。 */
export const ITEM_TOOLTIP = {
  ...AXIS_TOOLTIP,
  trigger: 'item' as const,
  axisPointer: undefined,
}

/** 图例：≥2 个序列时必须存在，识别不能只靠颜色。 */
export const LEGEND = {
  show: true,
  right: 0,
  top: 0,
  itemWidth: 8,
  itemHeight: 8,
  itemGap: 14,
  icon: 'roundRect',
  textStyle: { color: CHART_TEXT_DIM, fontSize: 11 },
}

/** 面积图的渐变填充。深色底上透明度要比浅色底高一档才看得出来 */
export function areaFill(color: string, opacity = 0.22) {
  return {
    color: {
      type: 'linear' as const,
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: hexToRgba(color, opacity) },
        { offset: 1, color: hexToRgba(color, 0) },
      ],
    },
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
