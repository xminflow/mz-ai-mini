'use client'

import { motion } from 'framer-motion'
import { useSyncExternalStore, type ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const
const preference = '(prefers-reduced-motion: reduce)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(preference)
  media.addEventListener('change', notify)
  return () => media.removeEventListener('change', notify)
}
const snapshot = () => window.matchMedia(preference).matches
const serverSnapshot = () => false

/** 首次水合与服务端保持一致，随后订阅真实系统偏好，避免条件按钮造成 DOM 不一致。 */
export function useNuboReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot)
}

/** 原站卡片有明显的纵向入场和轻微回正，独立于其他模板的通用淡入。 */
export function Reveal({ children, className, delay = 0, tilt = 0 }: { children: ReactNode; className?: string; delay?: number; tilt?: number }) {
  const reduced = useNuboReducedMotion()
  return <motion.div className={['nb-reveal', className].filter(Boolean).join(' ')} initial={reduced ? false : { opacity: 0, y: 53, rotate: tilt }}
    whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease }}>{children}</motion.div>
}

export function TitleLines({ children }: { children: string }) {
  const reduced = useNuboReducedMotion()
  // 观察未移动的裁切容器；观察初始位于容器外的文字本身会永远等不到入场。
  return children.split('\n').map((line, index) => <motion.span className="nb-title-line" key={index}
    initial={reduced ? false : 'hidden'} whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
    <motion.span variants={{ hidden: { y: '110%', opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : index * 0.12, ease }}>
      {line.replace(/[，。；：！？]+$/u, '')}
    </motion.span>
  </motion.span>)
}
