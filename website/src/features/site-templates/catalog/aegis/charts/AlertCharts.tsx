'use client'

import { useMemo } from 'react'
import { ALERT_SEVERITY_DIST } from '../data'
import { EChart } from './EChart'
import { CHART_SURFACE, CHART_TEXT_DIM, ITEM_TOOLTIP, SEVERITY_CHART_COLORS } from './chartTheme'

/**
 * 告警严重度构成。
 *
 * 用环形图的前提是：这是不折不扣的部分与整体、只有三段、且三段量级差得开
 * （3 / 8 / 14）。任何一条不成立都该退回条形图——环形图不适合比较接近的值。
 * 中心留白放总数，因为"一共多少条"才是这张图最先被问到的问题。
 */
export function SeverityDonutChart() {
  const option = useMemo(() => {
    const total = ALERT_SEVERITY_DIST.reduce((sum, item) => sum + item.count, 0)

    return {
      tooltip: ITEM_TOOLTIP,
      legend: {
        show: true,
        bottom: 0,
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 16,
        icon: 'roundRect',
        textStyle: { color: CHART_TEXT_DIM, fontSize: 11 },
      },
      series: [
        {
          type: 'pie' as const,
          radius: ['58%', '82%'],
          center: ['50%', '44%'],
          avoidLabelOverlap: true,
          // 段与段之间留出与底色同色的细缝，而不是给每段描边
          itemStyle: { borderColor: CHART_SURFACE, borderWidth: 2 },
          label: {
            show: true,
            position: 'outside' as const,
            formatter: '{b} {c}',
            color: CHART_TEXT_DIM,
            fontSize: 11,
          },
          labelLine: { length: 8, length2: 8, lineStyle: { color: '#d6dae0' } },
          data: ALERT_SEVERITY_DIST.map((item) => ({
            name: item.label,
            value: item.count,
            itemStyle: { color: SEVERITY_CHART_COLORS[item.severity] },
          })),
        },
      ],
      // 环心的总数是这张图的主答案，用 graphic 层单独绘制而不是靠系列标签
      graphic: [
        {
          type: 'text' as const,
          left: 'center',
          top: '33%',
          style: { text: String(total), fontSize: 26, fontWeight: 600, fill: '#1b1f26', textAlign: 'center' as const },
        },
        {
          type: 'text' as const,
          left: 'center',
          top: '48%',
          style: { text: '活跃告警', fontSize: 11, fill: CHART_TEXT_DIM, textAlign: 'center' as const },
        },
      ],
    }
  }, [])

  return (
    <EChart option={option} height={240} ariaLabel="活跃告警按严重度构成：严重 3 条、警告 8 条、提示 14 条，共 25 条" />
  )
}
