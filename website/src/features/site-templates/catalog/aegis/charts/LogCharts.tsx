'use client'

import { useMemo } from 'react'
import { HOURS, LOG_VOLUME_SERIES } from '../data'
import { EChart } from './EChart'
import {
  ACCENT,
  AXIS_TOOLTIP,
  GRID,
  LEGEND,
  LOG_LEVEL_COLORS,
  areaFill,
  categoryAxis,
  valueAxis,
} from './chartTheme'

/**
 * 日志两张图刻意分开画，而不是把四个等级堆进同一张图。
 *
 * DEBUG 单小时两万多条、ERROR 只有几百条，堆叠之后 ERROR 那一层薄到看不见——
 * 而恰恰只有 ERROR 那一层是运维要看的。总量与异常量的数量级差两个数量级，
 * 就该给它们各自的纵轴，而不是逼读者在一张图里辨认一条 1% 高度的色带。
 */

/** 日志总量：四个等级求和后的单序列面积图，回答"今天日志量正常吗"。 */
export function LogVolumeChart() {
  const option = useMemo(() => {
    const total = HOURS.map(
      (_, i) =>
        LOG_VOLUME_SERIES.DEBUG[i] +
        LOG_VOLUME_SERIES.INFO[i] +
        LOG_VOLUME_SERIES.WARN[i] +
        LOG_VOLUME_SERIES.ERROR[i],
    )

    return {
      tooltip: AXIS_TOOLTIP,
      grid: GRID,
      xAxis: categoryAxis(HOURS),
      yAxis: valueAxis(),
      series: [
        {
          name: '日志条数',
          type: 'line' as const,
          smooth: 0.3,
          showSymbol: false,
          lineStyle: { width: 2, color: ACCENT },
          itemStyle: { color: ACCENT },
          areaStyle: areaFill(ACCENT),
          data: total,
        },
      ],
    }
  }, [])

  return <EChart option={option} height={180} ariaLabel="近 24 小时日志总量趋势，与业务流量同形" />
}

/** 异常日志：WARN 与 ERROR 两条线单独成图，回答"异常在什么时候爆发"。 */
export function LogErrorChart() {
  const option = useMemo(
    () => ({
      tooltip: AXIS_TOOLTIP,
      legend: LEGEND,
      grid: { ...GRID, top: 28 },
      xAxis: categoryAxis(HOURS),
      yAxis: valueAxis(),
      series: [
        {
          name: 'WARN',
          type: 'line' as const,
          smooth: 0.3,
          showSymbol: false,
          lineStyle: { width: 2, color: LOG_LEVEL_COLORS.WARN },
          itemStyle: { color: LOG_LEVEL_COLORS.WARN },
          data: LOG_VOLUME_SERIES.WARN,
        },
        {
          name: 'ERROR',
          type: 'line' as const,
          smooth: 0.3,
          showSymbol: false,
          lineStyle: { width: 2, color: LOG_LEVEL_COLORS.ERROR },
          itemStyle: { color: LOG_LEVEL_COLORS.ERROR },
          areaStyle: areaFill(LOG_LEVEL_COLORS.ERROR),
          data: LOG_VOLUME_SERIES.ERROR,
        },
      ],
    }),
    [],
  )

  return (
    <EChart option={option} height={180} ariaLabel="近 24 小时 WARN 与 ERROR 日志条数，14 时 ERROR 激增至 644 条" />
  )
}
