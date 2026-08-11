'use client'

import { useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  speed?: number
  className?: string
  /** 反向滚动。双排画廊里让两排相向而行，比同向更像画廊、不像传送带 */
  reverse?: boolean
  /** 轨道内元素间距。默认值保持旧调用方的观感不变 */
  gapClass?: string
  /** 悬停暂停，让人能读完一张卡再继续 */
  pauseOnHover?: boolean
}

/** 由 gap-* 推出同尺寸的 pr-*：两个半区之间也要留出同样的间距，否则接缝处会挤在一起 */
const toPadClass = (gapClass: string): string => {
  const match = /^gap-(.+)$/.exec(gapClass)
  return match ? `pr-${match[1]}` : 'pr-12'
}

export const Marquee = ({
  children,
  speed = 40,
  className = '',
  reverse = false,
  gapClass = 'gap-12',
  pauseOnHover = false,
}: MarqueeProps) => {
  const reduce = useReducedMotion()
  const halfClass = `flex shrink-0 items-center ${gapClass} ${toPadClass(gapClass)}`

  // 命中「减少动态效果」时不自动滚动，改成可手动横向滚动，内容仍然拿得到；
  // 且只渲染一份——不滚动就不需要那份用于无缝衔接的副本，留着会被读屏软件念两遍。
  if (reduce) {
    return (
      <div className={`scrollbar-hide relative flex w-full overflow-x-auto ${className}`}>
        <div className={`flex shrink-0 items-center ${gapClass}`}>{children}</div>
      </div>
    )
  }

  return (
    <div
      className={`group relative flex w-full overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}
    >
      {/* 两个半区必须完全等宽：keyframes 位移的是 -50%，不等宽接缝处就会跳 */}
      <div
        className={[
          'flex shrink-0',
          pauseOnHover ? 'group-hover:[animation-play-state:paused]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          animation: `marqueeScroll ${speed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
          willChange: 'transform',
        }}
      >
        <div className={halfClass}>{children}</div>
        {/* 副本只为无缝衔接，对读屏软件隐藏，避免同一张卡被念两遍 */}
        <div aria-hidden className={halfClass}>
          {children}
        </div>
      </div>
    </div>
  )
}
