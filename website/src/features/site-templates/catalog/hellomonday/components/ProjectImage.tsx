'use client'

import { useEffect, useId, useRef, type PointerEvent } from 'react'
import { animate, type AnimationPlaybackControls } from 'framer-motion'
import { MotionImage, useMotionPreference } from './Shared'

type Point = { x: number; y: number }
type Outline = { width: number; height: number; rest: Point[]; current: Point[] }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function createOutline(width: number, height: number): Outline {
  const rest: Point[] = []
  const verticalSteps = Math.max(2, Math.round(height / (width / 4)))
  for (let i = 0; i < 4; i++) rest.push({ x: width * i / 4, y: 0 })
  for (let i = 0; i < verticalSteps; i++) rest.push({ x: width, y: height * i / verticalSteps })
  for (let i = 4; i > 0; i--) rest.push({ x: width * i / 4, y: height })
  for (let i = verticalSteps; i > 0; i--) rest.push({ x: 0, y: height * i / verticalSteps })
  return { width, height, rest, current: rest.map(point => ({ ...point })) }
}

// 闭合 Catmull–Rom 曲线转换为贝塞尔段，让鼠标附近的边缘连续弯曲。
function outlinePath({ current: points, width, height }: Outline): string {
  const point = (index: number) => points[(index + points.length) % points.length]
  const xy = (p: Point) => `${(p.x / width).toFixed(5)} ${(p.y / height).toFixed(5)}`
  let path = `M${xy(points[0])}`
  for (let i = 0; i < points.length; i++) {
    const [a, b, c, d] = [point(i - 1), point(i), point(i + 1), point(i + 2)]
    path += `C${xy({ x: b.x + (c.x - a.x) / 6, y: b.y + (c.y - a.y) / 6 })} ${xy({ x: c.x - (d.x - b.x) / 6, y: c.y - (d.y - b.y) / 6 })} ${xy(c)}`
  }
  return `${path}Z`
}

export function ProjectImage({ src, alt }: { src: string; alt: string }) {
  const id = `hm-outline-${useId().replace(/:/g, '')}`
  const reduced = useMotionPreference()
  const path = useRef<SVGPathElement>(null)
  const picture = useRef<HTMLDivElement>(null)
  const outline = useRef<Outline | null>(null)
  const animation = useRef<AnimationPlaybackControls | null>(null)
  const released = useRef(false)

  const restore = () => {
    animation.current?.stop()
    picture.current?.style.removeProperty('clip-path')
    outline.current = null
  }
  useEffect(() => {
    if (reduced) restore()
    return () => animation.current?.stop()
  }, [reduced])

  const transition = (targets: Point[], returning = false) => {
    animation.current?.stop()
    const geometry = outline.current
    if (!geometry) return
    const start = geometry.current.map(point => ({ ...point }))
    // 仅活动图片更新蒙版路径，不扭曲纹理，也不逐帧重渲染作品列表。
    animation.current = animate(0, 1, {
      duration: returning ? 1.25 : .55,
      ease: returning ? [.22, 1.25, .36, 1] : [.16, 1, .3, 1],
      onUpdate: progress => {
        geometry.current = start.map((point, i) => ({ x: point.x + (targets[i].x - point.x) * progress, y: point.y + (targets[i].y - point.y) * progress }))
        path.current?.setAttribute('d', outlinePath(geometry))
      },
      onComplete: () => { if (returning) restore() },
    })
  }

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse' || released.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (!outline.current || outline.current.width !== rect.width || outline.current.height !== rect.height) outline.current = createOutline(rect.width, rect.height)
    const geometry = outline.current
    const { width, height, rest } = geometry
    const mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const edges = [mouse.y, width - mouse.x, height - mouse.y, mouse.x]
    const edge = edges.indexOf(Math.min(...edges))
    // 进入图片深处后释放边缘，同次悬浮不持续揉动图片内部。
    if (Math.min(...edges) > Math.min(width * .25, height * .34)) {
      released.current = true
      transition(rest, true)
      return
    }
    const targets = rest.map(point => {
      const distance = Math.hypot(point.x - mouse.x, point.y - mouse.y)
      const influence = clamp(2 - distance / (width * .255), 0, 1)
      const dx = width / 2 - point.x, dy = height / 2 - point.y
      const length = Math.hypot(dx, dy)
      const corner = (point.x === 0 || point.x === width) && (point.y === 0 || point.y === height)
      const force = Math.max(0, length - Math.min(width, height) / 4) * (corner ? .3 : .2) * influence
      const next = { x: point.x + dx / length * force, y: point.y + dy / length * force }
      const sameEdge = [point.y === 0, point.x === width, point.y === height, point.x === 0][edge]
      if ((sameEdge || corner) && Math.hypot(next.x - mouse.x, next.y - mouse.y) < width * .165) {
        next.x = clamp(mouse.x, 0, width)
        next.y = clamp(mouse.y, 0, height)
      }
      return next
    })
    picture.current?.style.setProperty('clip-path', `url(#${id})`)
    transition(targets)
  }
  const reset = () => { released.current = false; if (outline.current) transition(outline.current.rest, true) }

  return <div className="hm-project-image" onPointerEnter={event => { released.current = false; move(event) }} onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    <svg className="hm-wave-defs" width="0" height="0" aria-hidden="true"><defs><clipPath id={id} clipPathUnits="objectBoundingBox"><path ref={path} d="M0 0H1V1H0Z" /></clipPath></defs></svg>
    <div ref={picture} className="hm-project-warp"><MotionImage src={src} alt={alt} loading="lazy" /></div>
  </div>
}
