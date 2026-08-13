'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type MarqueeProps = {
  children: ReactNode[]
  /** 每帧自动滚动像素，正数向左滚、负数向右滚 */
  speed?: number
  gapClass?: string
  className?: string
}

// 横向无缝跑马灯：内容复制一份实现循环。用浮点累加器保存真实位置再写回 scrollLeft，
// 规避浏览器对 scrollLeft 的整数取整（<1px 增量会被抹平导致不动）。
// 自动滚动 + 悬停/触摸暂停 + 鼠标拖拽擦除，触屏交给原生滚动。
// 尊重 prefers-reduced-motion：不自动滚动，仅保留手动滚动。
export function Marquee({ children, speed = 0.4, gapClass = 'gap-4', className = '' }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const pos = useRef(0)
  const drag = useRef({ active: false, startX: 0, startLeft: 0 })
  const half = children.length

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const step = () => {
      if (!paused.current && !drag.current.active && el.scrollWidth > el.clientWidth) {
        const loop = el.scrollWidth / 2
        pos.current = (((pos.current + speed) % loop) + loop) % loop
        el.scrollLeft = pos.current
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [speed])

  return (
    <div
      ref={ref}
      onPointerEnter={() => {
        paused.current = true
      }}
      onPointerLeave={() => {
        paused.current = false
        drag.current.active = false
      }}
      onPointerDown={(e) => {
        const el = ref.current
        if (!el) return
        if (e.pointerType === 'mouse') {
          drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft }
          el.setPointerCapture(e.pointerId)
        } else {
          paused.current = true
        }
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return
        const el = ref.current
        if (!el) return
        const loop = el.scrollWidth / 2
        const next = (((drag.current.startLeft - (e.clientX - drag.current.startX)) % loop) + loop) % loop
        el.scrollLeft = next
        pos.current = next
      }}
      onPointerUp={(e) => {
        if (drag.current.active) {
          drag.current.active = false
          ref.current?.releasePointerCapture(e.pointerId)
        }
        paused.current = false
      }}
      className={`flex ${gapClass} cursor-grab select-none overflow-x-auto active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)',
      }}
    >
      {[...children, ...children].map((child, i) => (
        <div key={i} aria-hidden={i >= half} className="flex-none">
          {child}
        </div>
      ))}
    </div>
  )
}
