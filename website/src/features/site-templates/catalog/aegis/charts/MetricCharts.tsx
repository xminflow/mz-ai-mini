'use client'

import { useMemo } from 'react'
import { HOURS } from '../data'
import { EChart } from './EChart'
import {
  ACCENT,
  AXIS_LABEL_STYLE,
  AXIS_TOOLTIP,
  GRID,
  LEGEND,
  SERIES_COLORS,
  STATUS_COLORS,
  areaFill,
  categoryAxis,
  valueAxis,
} from './chartTheme'

/**
 * 项目详情页的核心时序图。
 *
 * 三条核心曲线（吞吐 / P95 延迟 / 错误率）共用同一个组件、同一套栅格与时间轴，
 * 而不是把吞吐与延迟叠进一张双轴图——双轴图的两条纵轴刻度是人为对齐的，
 * 会凭空造出数据里并不存在的相关性。拆成小多图后，走势对比靠横轴时间自然完成。
 *
 * 数据一律由调用方以 props 传入：项目可以在详情页里切换，图表不能自己绑死某份数据。
 */

/**
 * 三张小多图共用的固定栅格。
 *
 * 不能用 containLabel 自动收缩：三张图的纵轴刻度文字长度不同（"12,600" / "4,383 ms" / "4%"），
 * 自动布局会让三个绘图区的左边界各不相同，同一时刻在三张图里横坐标对不上，
 * "共享时间轴"就只是句口号。固定 left 才能让三张图真正逐列对齐。
 */
const TIME_SERIES_GRID = { left: 68, right: 16, top: 12, bottom: 26, containLabel: false }

/** 故障时段背景标注。只有真出过事的项目才画，healthy 的项目不该凭空多一条红带。 */
const INCIDENT_MARK_AREA = {
  silent: true,
  itemStyle: { color: 'rgba(225, 29, 72, 0.05)' },
  data: [[{ xAxis: '14:00' }, { xAxis: '16:00' }]],
}

export type MetricTone = 'accent' | 'warn' | 'crit'

const TONE_COLOR: Record<MetricTone, string> = {
  accent: ACCENT,
  warn: STATUS_COLORS.warn,
  crit: STATUS_COLORS.crit,
}

interface MetricSeriesChartProps {
  series: number[]
  tone: MetricTone
  /** 纵轴刻度后缀，如 `ms`、`%`、`条/秒` */
  unit: string
  /** 传入时在该值处画一条阈值线 */
  threshold?: number
  thresholdLabel?: string
  showIncident?: boolean
  ariaLabel: string
}

export function MetricSeriesChart({
  series,
  tone,
  unit,
  threshold,
  thresholdLabel,
  showIncident,
  ariaLabel,
}: MetricSeriesChartProps) {
  const option = useMemo(() => {
    const color = TONE_COLOR[tone]

    return {
      tooltip: AXIS_TOOLTIP,
      grid: TIME_SERIES_GRID,
      xAxis: categoryAxis(HOURS),
      // 刻度上不重复单位：每张图上方的行标题已经写了「接口调用量 次/分钟」，
      // 再在六个刻度上各印一遍"次/分钟"只是噪声，坐标轴应当是退到背景里的
      yAxis: valueAxis(),
      series: [
        {
          type: 'line' as const,
          smooth: 0.3,
          showSymbol: false,
          lineStyle: { width: 2, color },
          itemStyle: { color },
          areaStyle: areaFill(color),
          data: series,
          markArea: showIncident ? INCIDENT_MARK_AREA : undefined,
          markLine:
            threshold === undefined
              ? undefined
              : {
                  silent: true,
                  symbol: 'none',
                  // 阈值线是这张图的主角，用实线加标注；虚线在图表里会被误读成"预测"
                  lineStyle: { color: STATUS_COLORS.crit, width: 1, type: 'solid' as const },
                  label: {
                    formatter: thresholdLabel ?? `阈值 ${threshold}${unit}`,
                    color: STATUS_COLORS.crit,
                    fontSize: 10,
                    position: 'insideEndTop' as const,
                  },
                  data: [{ yAxis: threshold }],
                },
        },
      ],
    }
  }, [series, tone, unit, threshold, thresholdLabel, showIncident])

  return <EChart option={option} height={168} ariaLabel={ariaLabel} />
}

/** 资源占用：CPU 与内存两条分类序列，固定配色顺序，带图例。 */
export function ResourceChart({
  cpu,
  memory,
  ariaLabel,
}: {
  cpu: number[]
  memory: number[]
  ariaLabel: string
}) {
  const option = useMemo(
    () => ({
      tooltip: AXIS_TOOLTIP,
      legend: LEGEND,
      grid: { ...GRID, top: 28 },
      xAxis: categoryAxis(HOURS),
      yAxis: valueAxis({ max: 100, axisLabel: { ...AXIS_LABEL_STYLE, formatter: '{value}%' } }),
      series: [
        buildResourceLine('CPU', cpu, SERIES_COLORS[0]),
        buildResourceLine('内存', memory, SERIES_COLORS[1]),
      ],
    }),
    [cpu, memory],
  )

  return <EChart option={option} height={220} ariaLabel={ariaLabel} />
}

function buildResourceLine(name: string, data: number[], color: string) {
  return {
    name,
    type: 'line' as const,
    smooth: 0.3,
    showSymbol: false,
    // 两条线叠在一起时不填充面积，否则相互遮挡
    lineStyle: { width: 2, color },
    itemStyle: { color },
    data,
  }
}
