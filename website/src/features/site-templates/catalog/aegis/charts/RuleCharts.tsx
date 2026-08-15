'use client'

import { useMemo } from 'react'
import { HOURS, THRESHOLD_PREVIEW } from '../data'
import { EChart } from './EChart'
import {
  AXIS_LABEL_STYLE,
  CHART_SURFACE,
  AXIS_TOOLTIP,
  GRID,
  STATUS_COLORS,
  areaFill,
  categoryAxis,
  valueAxis,
} from './chartTheme'

/**
 * 阈值预览。
 *
 * 规则配置页最难回答的问题是"我把阈值设成这个数，会不会天天被吵醒"。
 * 把阈值线直接叠在被监控项目过去 24 小时的真实曲线上，并逐点标出越界样本，
 * 这个问题就变成看一眼的事——比在表单旁边写一句"建议值 1500ms"有用得多。
 */
export function ThresholdPreviewChart() {
  const option = useMemo(() => {
    const { series, threshold, unit } = THRESHOLD_PREVIEW

    // 只在越界处显示标记点，其余点隐藏——"每个点都画一个圈"是图表里最常见的噪声来源
    const breachPoints = series.map((value) => (value > threshold ? value : null))

    return {
      tooltip: AXIS_TOOLTIP,
      grid: GRID,
      xAxis: categoryAxis(HOURS, 2),
      yAxis: valueAxis({ axisLabel: { ...AXIS_LABEL_STYLE, formatter: `{value} ${unit}` } }),
      series: [
        {
          name: 'P95',
          type: 'line' as const,
          smooth: 0.3,
          showSymbol: false,
          lineStyle: { width: 2, color: STATUS_COLORS.info },
          itemStyle: { color: STATUS_COLORS.info },
          areaStyle: areaFill(STATUS_COLORS.info, 0.1),
          data: series,
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: STATUS_COLORS.crit, width: 1, type: 'solid' as const },
            label: {
              formatter: `阈值 ${threshold}${unit}`,
              color: STATUS_COLORS.crit,
              fontSize: 10,
              position: 'insideEndTop' as const,
            },
            data: [{ yAxis: threshold }],
          },
        },
        {
          name: '越界',
          type: 'line' as const,
          // 越界点单独成一个序列：折线不连、只留标记点，视觉上是"打在曲线上的红点"
          lineStyle: { width: 0 },
          symbolSize: 8,
          itemStyle: { color: STATUS_COLORS.crit, borderColor: CHART_SURFACE, borderWidth: 2 },
          data: breachPoints,
          tooltip: { show: false },
        },
      ],
    }
  }, [])

  return (
    <EChart
      option={option}
      height={200}
      ariaLabel={`${THRESHOLD_PREVIEW.projectName} 的 P95 曲线与 ${THRESHOLD_PREVIEW.threshold}${THRESHOLD_PREVIEW.unit} 阈值线，期间共 ${THRESHOLD_PREVIEW.breachCount} 个小时越界`}
    />
  )
}
