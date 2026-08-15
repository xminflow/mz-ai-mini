'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkAreaComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

/**
 * echarts 基座封装。
 *
 * 只装 echarts 本体、不装 echarts-for-react：需要的能力就是 init / setOption /
 * resize / dispose 这四件事，四十行足够，少一个依赖也避开第三方包对 React 19 的适配问题。
 *
 * 按需注册而非 `import * as echarts from 'echarts'`：全量包约 330KB，
 * 这里只用到折线、柱、饼三种图与四个组件，打包体积能压到一半以下。
 * 新增图表类型时必须回到这里补注册，否则运行时图形不渲染且不报错。
 */
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkAreaComponent,
  GraphicComponent,
  CanvasRenderer,
])

interface EChartProps {
  option: echarts.EChartsCoreOption
  /** 容器高度（像素）。必须把 x 轴刻度所占的高度算进去，否则轴标签会被裁掉。 */
  height: number
  /** 图表的等价文字描述，供读屏使用；图不是唯一的信息通路。 */
  ariaLabel: string
  className?: string
}

export function EChart({ option, height, ariaLabel, className }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  // 实例的创建与销毁只跟随挂载，不跟随 option：把两者放进同一个 effect 会导致
  // 每次 option 变更都重建实例，动画与交互状态全部丢失。
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const chart = echarts.init(element, undefined, { renderer: 'canvas' })
    chartRef.current = chart

    // echarts 不感知容器尺寸变化，响应式布局下必须自己接 ResizeObserver。
    // 只监听自身容器而不是 window：预览页切换 iframe 宽度时不会触发 window resize。
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(element)

    return () => {
      observer.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  // 调用方必须用 useMemo 稳定 option 引用，否则每次重渲染都会白白重画一遍。
  useEffect(() => {
    chartRef.current?.setOption(option, true)
  }, [option])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: '100%' }}
      role="img"
      aria-label={ariaLabel}
    />
  )
}
