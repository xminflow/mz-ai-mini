'use client'

import { useMemo } from 'react'
import { ALERT_TREND, BUDGET_RANKING_SIZE, HOURS, PROJECTS } from '../data'
import { EChart } from './EChart'
import {
  AXIS_TOOLTIP,
  CHART_SURFACE,
  CHART_TEXT_DIM,
  GRID,
  LEGEND,
  SEVERITY_CHART_COLORS,
  STATUS_COLORS,
  categoryAxis,
  valueAxis,
} from './chartTheme'

/**
 * 总览页的两张图直接从 ../data 取数：它们展示的是全局聚合，不随任何选择变化。
 * （项目详情页的图表则相反，必须由调用方传数据，因为项目可以切换。）
 */

/** 全局告警趋势：按严重度堆叠的 24 小时柱状图。 */
export function AlertTrendChart() {
  const option = useMemo(
    () => ({
      tooltip: AXIS_TOOLTIP,
      legend: LEGEND,
      grid: { ...GRID, top: 28 },
      xAxis: categoryAxis(HOURS),
      yAxis: valueAxis({ minInterval: 1 }),
      series: [
        buildStackedBar('严重', ALERT_TREND.critical, SEVERITY_CHART_COLORS.critical),
        buildStackedBar('警告', ALERT_TREND.warning, SEVERITY_CHART_COLORS.warning),
        buildStackedBar('提示', ALERT_TREND.info, SEVERITY_CHART_COLORS.info),
      ],
    }),
    [],
  )

  return (
    <EChart
      option={option}
      height={220}
      ariaLabel="近 24 小时全局告警触发次数按严重度堆叠柱状图，14 时出现明显峰值"
    />
  )
}

/** 堆叠段之间留一条与底色同色的细缝，而不是给每段描边。 */
function buildStackedBar(name: string, data: number[], color: string) {
  return {
    name,
    type: 'bar' as const,
    stack: 'alerts',
    barMaxWidth: 14,
    itemStyle: { color, borderColor: CHART_SURFACE, borderWidth: 1 },
    data,
  }
}




/**
 * SLO 误差预算消耗排行。
 *
 * 这里画的是预算消耗率而不是可用性：14 个项目的可用性都落在 98.9%~100% 区间，
 * 条形长度肉眼几乎无差，唯一的"办法"是截断纵轴，而截断轴是误导。
 * 预算消耗率天然从 0 起算，条形长度就是真实差距。
 */
export function BudgetRankingChart() {
  const option = useMemo(() => {
    // 取消耗最高的 N 个，再按升序排列——横向条形轴自下而上，升序排完最长的一条在顶部
    const ranked = [...PROJECTS]
      .sort((a, b) => b.budgetUsed - a.budgetUsed)
      .slice(0, BUDGET_RANKING_SIZE)
      .reverse()

    return {
      tooltip: { ...AXIS_TOOLTIP, axisPointer: { type: 'shadow' as const } },
      grid: { ...GRID, left: 4, right: 44, top: 20 },
      xAxis: valueAxis({ max: 145, axisLabel: { show: false }, splitLine: { show: false } }),
      yAxis: {
        type: 'category' as const,
        data: ranked.map((project) => project.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: CHART_TEXT_DIM, fontSize: 11 },
      },
      series: [
        {
          name: '误差预算消耗',
          type: 'bar' as const,
          barMaxWidth: 12,
          // 颜色跟随项目自身的健康状态（状态语义），不是按排名重新着色
          data: ranked.map((project) => ({
            value: project.budgetUsed,
            itemStyle: {
              color:
                STATUS_COLORS[
                  project.status === 'healthy' ? 'ok' : project.status === 'warning' ? 'warn' : 'crit'
                ],
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: {
            show: true,
            position: 'right' as const,
            formatter: '{c}%',
            color: CHART_TEXT_DIM,
            fontSize: 11,
          },
          markLine: {
            silent: true,
            symbol: 'none',
            // 竖直 markLine 的标签默认会跟着线一起旋转 90°，必须显式扳回 0°
            label: {
              show: true,
              formatter: '预算耗尽',
              color: CHART_TEXT_DIM,
              fontSize: 10,
              position: 'end' as const,
              rotate: 0,
              distance: 6,
            },
            lineStyle: { color: STATUS_COLORS.crit, width: 1, type: 'solid' as const, opacity: 0.5 },
            data: [{ xAxis: 100 }],
          },
        },
      ],
    }
  }, [])

  return (
    <EChart
      option={option}
      height={252}
      ariaLabel={`误差预算消耗最高的 ${BUDGET_RANKING_SIZE} 个项目排行，实时数仓入湖已透支 132%`}
    />
  )
}
