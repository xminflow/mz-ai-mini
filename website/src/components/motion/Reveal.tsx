'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  y?: number
  once?: boolean
  // 可选：初始缩放与模糊，做"逐渐成形"的动态入场（默认关闭，保持旧用法不变）
  scale?: number
  blur?: number
  duration?: number
}

export const Reveal = ({
  children,
  delay = 0,
  y = 24,
  once = true,
  scale = 1,
  blur = 0,
  duration = 0.7,
  ...rest
}: RevealProps) => {
  // 命中「减少动态效果」时直接呈现终态：位移与模糊对前庭敏感人群是主要不适来源
  const reduce = useReducedMotion()

  const hidden = reduce
    ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
    : { opacity: 0, y, scale, filter: `blur(${blur}px)` }

  return (
    <motion.div
      initial={hidden}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.25 }}
      transition={{
        duration: reduce ? 0 : duration,
        delay: reduce ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
