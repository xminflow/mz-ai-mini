'use client'

import { useEffect, useState } from 'react'

const prefix = '你可以在 '
const brand = 'WorkBuddy'
const suffix = '，豆包等智能体中使用这些网站模板搭建你自己的网站'
const message = `${prefix}${brand}${suffix}`

export function WorkBuddyIntro() {
  const [length, setLength] = useState(0)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: ReturnType<typeof setInterval> | undefined
    function start() {
      clearInterval(timer)
      if (media.matches) {
        setLength(message.length)
        return
      }
      let cursor = 0
      setLength(0)
      timer = setInterval(() => {
        cursor += 1
        setLength(cursor)
        if (cursor === message.length) clearInterval(timer)
      }, 55)
    }
    start()
    media.addEventListener('change', start)
    return () => {
      clearInterval(timer)
      media.removeEventListener('change', start)
    }
  }, [])

  return (
    <p className="market-workbuddy-intro" aria-label={message}>
      {/* 用完整文案预留换行高度，避免打字时下方模板列表跳动。 */}
      <span className="market-workbuddy-reserve" aria-hidden="true">
        {prefix}<span className="market-workbuddy-brand">{brand}</span>{suffix}
      </span>
      <span className="market-workbuddy-typed" aria-hidden="true" data-typing={length < message.length}>
        {prefix.slice(0, length)}
        <span className="market-workbuddy-brand">{brand.slice(0, Math.max(0, length - prefix.length))}</span>
        {suffix.slice(0, Math.max(0, length - prefix.length - brand.length))}
      </span>
    </p>
  )
}
