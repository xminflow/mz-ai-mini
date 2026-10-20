'use client'

import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { Reveal as SharedReveal } from '../../../shared/Reveal'

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  return <SharedReveal className={`tpl-reveal ${className ?? ''}`} delay={reduced ? 0 : delay}>{children}</SharedReveal>
}

const ease = [0.22, 1, 0.36, 1] as const

/** 直接动画已有子元素，保留 grid、flex 和服务端组件原本的排版关系。 */
export function ScrollGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const container = ref.current
    if (!container || reduced) return
    const elements = Array.from(container.children).filter((node): node is HTMLElement => node instanceof HTMLElement)
    const original = new Map(elements.map((element) => [element, { opacity: element.style.opacity, transform: element.style.transform }]))
    const running: ReturnType<typeof animate>[] = []
    const restore = (element: HTMLElement) => {
      const style = original.get(element)
      if (style) Object.assign(element.style, style)
    }
    const reveal = (element: HTMLElement, instant = false) => {
      if (element.dataset.motionState === 'visible') return
      element.dataset.motionState = 'visible'
      observer.unobserve(element)
      running.push(animate(element, { opacity: 1, y: 0 }, {
        duration: instant ? 0 : 0.7,
        delay: instant ? 0 : Math.min(elements.indexOf(element) % 3 * 0.09, 0.18),
        ease,
        onComplete: () => restore(element),
      }))
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement)
      })
    }, { threshold: 0.12 })

    elements.forEach((element) => {
      element.dataset.motionState = 'pending'
      element.style.opacity = '0'
      element.style.transform = 'translateY(28px)'
      observer.observe(element)
    })
    // 键盘焦点进入尚未滚到的内容时立即显示，避免焦点落在透明元素上。
    const onFocus = (event: FocusEvent) => {
      const element = elements.find((item) => event.target instanceof Node && item.contains(event.target))
      if (element) reveal(element, true)
    }
    container.addEventListener('focusin', onFocus)
    return () => {
      observer.disconnect()
      container.removeEventListener('focusin', onFocus)
      running.forEach((animation) => animation.stop())
      elements.forEach((element) => {
        restore(element)
        delete element.dataset.motionState
      })
    }
  }, [reduced])

  return <div ref={ref} className={`tpl-scroll-group ${className ?? ''}`}>{children}</div>
}

export function TitleLines({ lead, trail }: { lead: string; trail: string }) {
  const reduced = useReducedMotion()
  return <>{[lead, trail].map((line, index) => (
    <span key={line} className={`tpl-title-mask ${index === 1 ? 'text-[var(--tpl-ink-faint)]' : ''}`}>
      <motion.span initial={{ y: '105%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : 0.12 + index * 0.14, ease }}>{line}</motion.span>
    </span>
  ))}</>
}

/** 无障碍文本始终保留最终值，动画数字仅作为视觉层，避免连续播报。 */
export function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true, amount: 0.5 })
  const reduced = useReducedMotion()
  const numeric = Number(value.replaceAll(',', ''))
  const decimals = value.includes('.') ? value.split('.')[1].length : 0
  const number = useMotionValue(numeric)
  const formatted = useTransform(number, (current) => current.toLocaleString('en-US', {
    useGrouping: value.includes(','), minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }))

  useEffect(() => {
    if (!visible || reduced || !Number.isFinite(numeric)) return
    const animation = animate(number, [0, numeric], { duration: 1.35, ease })
    return () => animation.stop()
  }, [visible, reduced, numeric, number])

  return <span ref={ref} className="tpl-number"><span className="sr-only">{value}</span><span className="tpl-number-space" aria-hidden>{value}</span><motion.span className="tpl-number-animated" aria-hidden>{formatted}</motion.span></span>
}

export function ReadingProgress() {
  const reduced = useReducedMotion()
  const progress = useMotionValue(0)
  const smoothProgress = useSpring(progress, { stiffness: 180, damping: 35 })
  useEffect(() => {
    if (reduced) return
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      progress.set(max > 0 ? window.scrollY / max : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [progress, reduced])
  // 首次 DOM 保持服务端与客户端一致，减少动态效果时由媒体查询隐藏，避免水合错位。
  return <motion.div className="tpl-reading-progress" style={{ scaleX: smoothProgress }} aria-hidden />
}

/** 只动画轨道，不变换列表容器，保留左侧 sticky 标题的滚动行为。 */
export function ProcessTimeline({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()
  const progress = useMotionValue(0)
  const smoothProgress = useSpring(progress, { stiffness: 180, damping: 35 })
  useEffect(() => {
    if (reduced) return
    const update = () => {
      const element = ref.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const start = window.innerHeight * 0.75
      const end = window.innerHeight * 0.65
      const range = Math.max(1, rect.height + start - end)
      progress.set(Math.min(1, Math.max(0, (start - rect.top) / range)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [progress, reduced])
  return <ol ref={ref} className="tpl-process-timeline relative">
    <li className="tpl-process-track" aria-hidden><motion.span style={{ scaleY: smoothProgress }} /></li>
    {children}
  </ol>
}
