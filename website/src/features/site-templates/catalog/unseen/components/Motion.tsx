'use client'

import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'

export const ease = [.22, 1, .36, 1] as const
const preference = '(prefers-reduced-motion: reduce)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(preference)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(preference).matches, () => false)
}

export function TitleLines({ lines }: { lines: string[] }) {
  const reduced = useMotionPreference()
  return <>{lines.map((line, index) => <span key={line} className="us-title-line"><motion.span
    initial={{ y: '110%', rotate: 4, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }}
    transition={{ duration: reduced ? 0 : 1.05, delay: reduced ? 0 : .18 + index * .13, ease }}
  >{line}</motion.span></span>)}</>
}

/** 文字与场景反向跟随，滚动时淡出并拉开景深；不改变文档的滚动来源。 */
export function HeroMotion({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const x = useMotionValue(0), y = useMotionValue(0)
  const smoothX = useSpring(x, { stiffness: 55, damping: 20 }), smoothY = useSpring(y, { stiffness: 55, damping: 20 })
  const { scrollY } = useScroll()
  const scrollOffset = useTransform(scrollY, value => reduced ? 0 : Math.min(value * .22, 160))
  const opacity = useTransform(scrollY, value => reduced ? 1 : Math.max(0, 1 - value / 650))
  useEffect(() => {
    if (reduced) { x.set(0); y.set(0); return }
    const section = ref.current?.parentElement
    if (!section) return
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      x.set((event.clientX / innerWidth - .5) * -38)
      y.set((event.clientY / innerHeight - .5) * -20)
    }
    const reset = () => { x.set(0); y.set(0) }
    section.addEventListener('pointermove', move, { passive: true }); section.addEventListener('pointerleave', reset)
    return () => { section.removeEventListener('pointermove', move); section.removeEventListener('pointerleave', reset) }
  }, [reduced, x, y])
  return <div ref={ref} className={className}><motion.div className="us-hero-depth" style={{ y: scrollOffset, opacity }}><motion.div className="us-hero-follow" style={{ x: smoothX, y: smoothY }}>{children}</motion.div></motion.div></div>
}

export function ParallaxImage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-7%', '7%'])
  return <div ref={ref} className="us-image-depth"><motion.div style={{ y }}>{children}</motion.div></div>
}

export function ScenePointer() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const x = useMotionValue(-100), y = useMotionValue(-100), scale = useMotionValue(0)
  const smoothX = useSpring(x, { stiffness: 170, damping: 24 }), smoothY = useSpring(y, { stiffness: 170, damping: 24 })
  const smoothScale = useSpring(scale, { stiffness: 130, damping: 20 })
  useEffect(() => {
    if (reduced || !matchMedia('(pointer: fine)').matches) return
    const move = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const active = !!target?.closest('.us-hero,.us-contact-hero') && !document.querySelector('dialog[open]')
      x.set(event.clientX); y.set(event.clientY); scale.set(active ? target?.closest('a,button') ? 1.6 : 1 : 0)
    }
    const leave = () => scale.set(0)
    window.addEventListener('pointermove', move, { passive: true }); document.documentElement.addEventListener('pointerleave', leave)
    return () => { window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave) }
  }, [reduced, x, y, scale])
  return <motion.div ref={ref} className="us-scene-pointer" aria-hidden="true" style={{ x: smoothX, y: smoothY, scale: reduced ? 0 : smoothScale }} />
}

/** 仅桌面滚轮做插值；触屏、嵌套滚动、键盘与滑块仍直接控制 document。 */
export function SmoothWheel() {
  const reduced = useMotionPreference()
  useEffect(() => {
    if (reduced || !matchMedia('(pointer: fine)').matches) return
    let frame = 0, target = scrollY, expected = scrollY, last = 0
    const stop = () => { cancelAnimationFrame(frame); frame = 0; target = scrollY }
    const tick = (now: number) => {
      const delta = Math.min(40, now - last || 16); last = now
      const current = scrollY, next = current + (target - current) * (1 - Math.exp(-delta / 85))
      expected = Math.abs(target - next) < .8 ? target : next
      window.scrollTo({ top: expected, behavior: 'instant' })
      if (Math.abs(target - scrollY) > 1) frame = requestAnimationFrame(tick); else { frame = 0; target = scrollY }
    }
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.defaultPrevented || Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.querySelector('dialog[open]')) return
      let node = event.target instanceof Element ? event.target : null
      while (node && node !== document.body) {
        if (node.matches('.us-world-viewport, input, select, textarea, [data-native-scroll]')) return
        if (node.scrollHeight > node.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(node).overflowY)) return
        node = node.parentElement
      }
      const maximum = Math.max(0, document.documentElement.scrollHeight - innerHeight)
      if (!maximum) return
      event.preventDefault()
      if (!frame) { target = scrollY; last = 0 }
      target = Math.max(0, Math.min(maximum, target + event.deltaY * (event.deltaMode === 1 ? 24 : event.deltaMode === 2 ? innerHeight : 1)))
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const externalScroll = () => { if (frame && Math.abs(scrollY - expected) > 3) stop() }
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('scroll', externalScroll, { passive: true })
    window.addEventListener('pointerdown', stop, { passive: true })
    window.addEventListener('keydown', stop)
    window.addEventListener('touchstart', stop, { passive: true })
    return () => {
      stop(); window.removeEventListener('wheel', wheel); window.removeEventListener('scroll', externalScroll)
      window.removeEventListener('pointerdown', stop); window.removeEventListener('keydown', stop); window.removeEventListener('touchstart', stop)
    }
  }, [reduced])
  return null
}
