'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  // 首次样式保持服务端与客户端一致；媒体偏好仅影响动画时长，避免水合时切换 initial。
  return <motion.div className={className} initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: reduced ? 0 : 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>
}
