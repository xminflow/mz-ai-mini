'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  y?: number
  once?: boolean
  // 可选：初始缩放与模糊，做"逐渐成形"的动态入场（默认关闭，保持旧用法不变）
  scale?: number
  blur?: number
}

export const Reveal = ({
  children,
  delay = 0,
  y = 24,
  once = true,
  scale = 1,
  blur = 0,
  ...rest
}: RevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.25 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
