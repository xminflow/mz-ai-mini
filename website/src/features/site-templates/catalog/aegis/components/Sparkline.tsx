/**
 * 迷你趋势线。
 *
 * 刻意用手写 SVG 而不是 echarts：卡片与表格里会同时出现十几个这种 60×20 的小图，
 * 每个都挂一个 canvas 实例既浪费又会拖慢滚动。这里是纯服务端组件，零客户端开销。
 *
 * 它只表达走势，不承担读数职责——具体数值由同一行的文字指标给出，
 * 因此不画坐标轴、不加提示层。
 */
export function Sparkline({
  data,
  color,
  width = 64,
  height = 20,
  filled = true,
}: {
  data: number[]
  color: string
  width?: number
  height?: number
  filled?: boolean
}) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  // 全平的序列会让分母为 0，这里退化成一条居中直线
  const span = max - min || 1
  // 留出 1px 上下边距，避免极值点被描边裁掉一半
  const inset = 1
  const stepX = width / (data.length - 1)

  const points = data.map((value, index) => {
    const x = index * stepX
    const y = inset + (1 - (value - min) / span) * (height - inset * 2)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const line = `M${points.join(' L')}`
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0" aria-hidden>
      {filled ? <path d={area} fill={color} fillOpacity={0.1} /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
