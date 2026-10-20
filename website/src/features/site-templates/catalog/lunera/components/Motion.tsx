'use client'

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

export { Reveal } from '../../../shared/Reveal'

export function CountUp({ value, suffix, label, decimals = 0 }: { value: number; suffix: string; label: string; decimals?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotion()
  const number = useMotionValue(0)
  const formatted = useTransform(number, (current) => current.toFixed(decimals))
  useEffect(() => {
    if (!visible) return
    const animation = animate(number, value, { duration: reduced ? 0 : 1.6, ease: 'easeOut' })
    return () => animation.stop()
  }, [visible, number, value, reduced])
  return <div ref={ref} className="ln-stat" role="group" aria-label={`${value}${suffix} ${label}`}>
    <div className="ln-stat-number" aria-hidden="true"><motion.span>{formatted}</motion.span>{suffix}</div>
    <p>{label}</p>
  </div>
}
