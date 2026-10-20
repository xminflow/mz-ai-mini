'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * 逐字进场：支持淡入上浮和打字机两种模式，完整文字预占位置，避免布局跳动。
 *
 * 拆字后仍是纯文本节点，取词、选中、SEO 抓取都不受影响；外层另给 aria-label，
 * 避免个别读屏软件把逐字 span 念成一个个孤立的字。
 *
 * 动画只跑一次：这是首屏第一眼的东西，滚回来重播会变成打扰。
 */
type RevealTextProps = {
  text: string
  mode?: 'fade' | 'typewriter'
  splitBy?: 'character' | 'word'
  className?: string
  /** 每个字之间的间隔，毫秒 */
  stepMs?: number
  /** 整段的起始延迟，用于让多行标题接续播放 */
  delayMs?: number
  as?: 'span' | 'div'
}

const DURATION_MS = 520

export const RevealText = ({
  text,
  mode = 'fade',
  splitBy = 'character',
  className = '',
  stepMs = 45,
  delayMs = 0,
  as: Tag = 'span',
}: RevealTextProps) => {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 首屏元素在挂载时就已经在视口里，不必等 IntersectionObserver；
  // 单独一帧再翻开关，是为了让浏览器先把初始态画出来，否则过渡不会触发。
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const chars = splitBy === 'word' ? (text.match(/\S+\s*/g) ?? []) : [...text]

  return (
    <Tag ref={ref} className={className} aria-label={text} data-text-reveal={mode}>
      {chars.map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden
          // inline-block 是位移的前提：行内元素上的 transform 不生效
          className="inline-block whitespace-pre"
          style={
            reduce
              ? undefined
              : {
                  opacity: shown ? 1 : 0,
                  transform: mode === 'typewriter' || shown ? 'none' : 'translateY(0.36em)',
                  transition: [
                    `opacity ${mode === 'typewriter' ? 0 : DURATION_MS}ms ease-out ${delayMs + index * stepMs}ms`,
                    ...(mode === 'typewriter' ? [] : [`transform ${DURATION_MS}ms cubic-bezier(0.22, 1, 0.26, 1) ${delayMs + index * stepMs}ms`]),
                  ].join(', '),
                }
          }
        >
          {char}
        </span>
      ))}
    </Tag>
  )
}
