'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'

/** 只绘制 document 的滚动位置，不创建嵌套滚动容器，保持首页视差的滚动来源。 */
export function PageScrollbar({ label, className, controlsId, autoHide = false }: { label: string; className: string; controlsId: string; autoHide?: boolean }) {
  const rail = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)
  const dragOffset = useRef<number | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    let frame = 0
    let idleTimer: ReturnType<typeof setTimeout> | undefined
    const update = () => {
      frame = 0
      const track = rail.current
      const handle = thumb.current
      if (!track || !handle) return
      const pageHeight = document.documentElement.scrollHeight
      const maximum = Math.max(0, pageHeight - innerHeight)
      const height = Math.min(track.clientHeight, Math.max(40, track.clientHeight * innerHeight / pageHeight))
      const progress = maximum ? Math.min(1, Math.max(0, scrollY / maximum)) : 0
      handle.style.height = `${height}px`
      handle.style.transform = `translateY(${progress * (track.clientHeight - height)}px)`
      track.dataset.scrollable = String(maximum > 0)
      track.tabIndex = maximum > 0 ? 0 : -1
      track.setAttribute('aria-valuemax', String(maximum))
      track.setAttribute('aria-valuenow', String(Math.round(progress * maximum)))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onScroll = () => {
      schedule()
      if (!autoHide || !rail.current) return
      rail.current.dataset.active = 'true'
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => { if (rail.current) rail.current.dataset.active = 'false' }, 1200)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(document.body)
    observer.observe(document.documentElement)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      clearTimeout(idleTimer)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
      cancelAnimationFrame(frame)
    }
  }, [autoHide])

  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    if (dragOffset.current === null || !thumb.current) return
    const track = event.currentTarget
    const travel = track.clientHeight - thumb.current.offsetHeight
    if (travel <= 0) return
    const progress = Math.min(1, Math.max(0, (event.clientY - track.getBoundingClientRect().top - dragOffset.current) / travel))
    window.scrollTo({ top: progress * Math.max(0, document.documentElement.scrollHeight - innerHeight), behavior: 'instant' })
  }

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !thumb.current) return
    event.preventDefault()
    const bounds = thumb.current.getBoundingClientRect()
    dragOffset.current = event.clientY >= bounds.top && event.clientY <= bounds.bottom ? event.clientY - bounds.top : bounds.height / 2
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    moveTo(event)
  }

  const endDrag = () => {
    dragOffset.current = null
    setDragging(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight)
    const targets: Record<string, number> = {
      ArrowUp: scrollY - 40, ArrowDown: scrollY + 40,
      PageUp: scrollY - innerHeight * .9, PageDown: scrollY + innerHeight * .9,
      Home: 0, End: maximum,
    }
    if (!(event.key in targets)) return
    event.preventDefault()
    window.scrollTo({ top: Math.min(maximum, Math.max(0, targets[event.key])), behavior: 'instant' })
  }

  return <div
    ref={rail} className={className} role="scrollbar"
    aria-label={label} aria-controls={controlsId} aria-orientation="vertical"
    aria-valuemin={0} aria-valuemax={0} aria-valuenow={0} tabIndex={-1}
    data-scrollable="false" data-dragging={dragging}
    onPointerDown={startDrag} onPointerMove={moveTo}
    onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}
    onKeyDown={onKeyDown}
  >
    <div ref={thumb} className={`${className}-thumb`} aria-hidden="true" />
  </div>
}
