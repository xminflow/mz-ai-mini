import type { AlertSeverity } from '../data'

/**
 * 图表配色与轴样式常量。
 *
 * 为什么是字面量十六进制而不是 var(--tpl-*)：echarts 用 canvas 渲染，
 * 拿不到 CSS 自定义属性，写 var() 会直接画不出颜色。因此这份常量必须与
 * theme.css 手工保持一致，改色时两处都要改。
 *
 * 配色经 dataviz 校验脚本验证（浅色底、分类调色板六项检查）：
 *   - 资源三序列 #2563eb / #0d9488 / #7c3aed —— 全项通过
 *   - 告警严重度 #e11d48 / #d97706 / #2563eb —— 全项通过
 * 注意 WARN 在图表里用 #d97706 而不是 theme.css 的 #f59e0b：
 * #f59e0b 在白底上对比度只有 2.09:1，达不到图表标记要求的 3:1；
 * 而徽标是「浅底 + 深色文字」的场景，用 #f59e0b 没有问题，两者不冲突。
 */

export const CHART_SURFACE = '#ffffff'
/** 网格线与轴线一律实线细发丝线，只比底色深一档；虚线会被误读成阈值 */
export const CHART_GRID = '#f0f1f3'
export const CHART_AXIS = '#e8eaed'
export const CHART_TEXT_DIM = '#6b7280'
export const CHART_TEXT_FAINT = '#9aa1ab'

export const ACCENT = '#2563eb'

/** 状态语义色。仅当颜色真的表达「好/坏」时使用，不得挪作第 N 个分类序列色。 */
export const STATUS_COLORS = {
  ok: '#10b981',
  warn: '#d97706',
  crit: '#e11d48',
  info: '#2563eb',
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
  critical: '#e11d48',
  warning: '#d97706',
  info: '#2563eb',
}

/** 分类序列固定顺序，永不循环、永不按排名重新分配。 */
export const SERIES_COLORS = ['#2563eb', '#0d9488', '#7c3aed'] as const

/**
 * 日志等级配色。DEBUG 刻意用低饱和灰蓝：它是「噪声/其它」槽位，
 * 校验脚本会因此报 chroma floor，这是设计意图而非疏漏——
 * DEBUG 必须在堆叠图里退到背景，且它始终带图例直标，识别不依赖颜色。
 */
export const LOG_LEVEL_COLORS = {
  DEBUG: '#64748b',
  INFO: '#2563eb',
  WARN: '#d97706',
  ERROR: '#e11d48',
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

/** 折线/面积图的十字准星提示层。 */
export const AXIS_TOOLTIP = {
  trigger: 'axis' as const,
  axisPointer: { type: 'line' as const, lineStyle: { color: CHART_AXIS, width: 1 } },
  backgroundColor: CHART_SURFACE,
  borderColor: CHART_AXIS,
  borderWidth: 1,
  padding: [8, 10] as [number, number],
  textStyle: { color: '#1b1f26', fontSize: 12 },
  extraCssText: 'box-shadow:0 4px 16px rgb(15 23 42 / 0.08);border-radius:6px;',
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

/** 面积图的浅色渐变填充，避免大块饱和色。 */
export function areaFill(color: string, opacity = 0.14) {
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
