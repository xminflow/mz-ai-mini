'use client'

import { useEffect, useRef, useState } from 'react'
import { useCopy } from './Shared'
import { SceneRenderer } from './scene-renderer'

/** 场景影像提供建筑细节，GPU 材质负责镜头视差、连续折射与交互涟漪。 */
export function Scene({ contact = false }: { contact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const { t } = useCopy()
  useEffect(() => {
    const element = canvas.current, container = host.current
    if (!element || !container) return
    let renderer: SceneRenderer
    try { renderer = new SceneRenderer(element) } catch (cause) {
      console.error('[unseen/scene] Renderer initialization failed', cause)
      container.dataset.state = 'error'
      const failureFrame = requestAnimationFrame(() => setFailed(true))
      return () => cancelAnimationFrame(failureFrame)
    }
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const section = container.parentElement!
    let frame = 0, visible = true, disposed = false, loaded = false, last = 0, image = new Image(), source = ''
    let pointer = { x: 0, y: 0 }, current = { x: 0, y: 0 }, rippleIndex = 0, lastRipple = 0
    const ripples = new Float32Array(16)
    const debug = (event: string, detail: Record<string, string | number | boolean> = {}) => {
      if (process.env.NODE_ENV === 'development') console.debug(`[unseen/scene] ${event}`, { contact, ...detail })
    }
    const draw = (now: number) => {
      frame = 0
      if (!loaded || disposed || !visible || document.hidden) return
      if (!media.matches && now - last < 30) { frame = requestAnimationFrame(draw); return }
      const delta = Math.min(64, now - last || 32)
      last = now
      const damping = 1 - Math.exp(-delta / 140)
      current = { x: current.x + (pointer.x - current.x) * damping, y: current.y + (pointer.y - current.y) * damping }
      const rect = section.getBoundingClientRect()
      renderer.draw({ time: now / 1000, motion: !media.matches, pointer: [current.x, current.y], scroll: Math.max(0, Math.min(1, -rect.top / rect.height)), waterline: contact ? .83 : .70, ripples })
      container.dataset.state = media.matches ? 'still' : 'running'
      if (!media.matches) frame = requestAnimationFrame(draw)
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw) }
    const resize = () => {
      const width = container.clientWidth, height = container.clientHeight
      renderer.resize(width, height)
      const device = width <= 600 ? 'mobile' : width <= 1000 ? 'tablet' : 'desktop'
      const nextSource = `/templates/unseen/scenes/${contact ? 'contact-desktop' : `home-${device}`}.webp`
      if (source !== nextSource) {
        source = nextSource; loaded = false
        image.onload = null; image.onerror = null
        image = new Image()
        image.onload = () => {
          if (disposed) return
          renderer.setImage(image); loaded = true; schedule()
          debug('image-ready', { source, width, height, reduced: media.matches })
        }
        image.onerror = () => { console.error('[unseen/scene] Scene image failed', { source }); setFailed(true); container.dataset.state = 'error' }
        image.src = source
      } else schedule()
    }
    const move = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect()
      if (event.clientY < rect.top || event.clientY > rect.bottom) return
      const x = event.clientX / rect.width, y = (event.clientY - rect.top) / rect.height
      pointer = { x: (x - .5) * 2, y: (y - .5) * 2 }
      const now = performance.now()
      if (!media.matches && y > (contact ? .8 : .68) && now - lastRipple > 140) {
        ripples.set([x, y, now / 1000, event.type === 'pointerdown' ? 1.5 : .7], rippleIndex * 4)
        rippleIndex = (rippleIndex + 1) % 4; lastRipple = now
        container.dataset.rippleCount = String(Number(container.dataset.rippleCount || 0) + 1)
      }
    }
    const leave = () => { pointer = { x: 0, y: 0 } }
    const preference = () => { debug('motion-preference', { reduced: media.matches }); schedule() }
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); container.dataset.state = 'paused' } else schedule()
    }
    const contextLost = (event: Event) => {
      event.preventDefault(); cancelAnimationFrame(frame); setFailed(true); container.dataset.state = 'error'
      console.error('[unseen/scene] WebGL context lost; reload required')
    }
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule(); else { cancelAnimationFrame(frame); container.dataset.state = 'paused' }
      debug('visibility', { visible })
    })
    const observer = new ResizeObserver(resize)
    observer.observe(container); intersection.observe(section)
    section.addEventListener('pointermove', move, { passive: true })
    section.addEventListener('pointerdown', move, { passive: true })
    section.addEventListener('pointerleave', leave)
    element.addEventListener('webglcontextlost', contextLost)
    document.addEventListener('visibilitychange', visibility)
    media.addEventListener('change', preference)
    resize()
    return () => {
      disposed = true; image.onload = null; image.onerror = null; observer.disconnect(); intersection.disconnect(); cancelAnimationFrame(frame)
      section.removeEventListener('pointermove', move); section.removeEventListener('pointerdown', move); section.removeEventListener('pointerleave', leave)
      element.removeEventListener('webglcontextlost', contextLost); document.removeEventListener('visibilitychange', visibility); media.removeEventListener('change', preference)
      renderer.dispose()
    }
  }, [contact])
  return <div ref={host} className={`us-scene ${contact ? 'us-scene-contact' : ''}`} data-renderer="webgl" aria-hidden={!failed}><canvas ref={canvas} />{failed && <p className="us-scene-error" role="status">{t('空间渲染失败，请启用浏览器图形加速后刷新重试', 'Scene rendering failed. Enable graphics acceleration, then refresh to try again.')}</p>}</div>
}
