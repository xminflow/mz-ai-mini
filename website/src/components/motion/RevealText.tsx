'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * 逐字进场：把一段文字拆成单字，依次淡入并微微上浮。
 *
 * 为什么不是真正的「打字机」：逐字冒出加闪烁光标是终端的语汇，与「专属贵宾服务」的
 * 定位相左。这里保留「一个字一个字浮现」的节奏，但每个字是淡入上浮而不是硬切出现。
 *
 * 拆字后仍是纯文本节点，取词、选中、SEO 抓取都不受影响；外层另给 aria-label，
 * 避免个别读屏软件把逐字 span 念成一个个孤立的字。
 *
 * 动画只跑一次：这是首屏第一眼的东西，滚回来重播会变成打扰。
 */
type RevealTextProps = {
  text: string
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

  const chars = [...text]

  return (
    <Tag ref={ref} className={className} aria-label={text}>
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
                  transform: shown ? 'none' : 'translateY(0.36em)',
                  transition: [
                    `opacity ${DURATION_MS}ms ease-out ${delayMs + index * stepMs}ms`,
                    `transform ${DURATION_MS}ms cubic-bezier(0.22, 1, 0.26, 1) ${delayMs + index * stepMs}ms`,
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
