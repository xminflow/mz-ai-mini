'use client'

import { useEffect, useRef } from 'react'

// asciinema 终端演示组件：课件里用 ```asciinema 围栏块触发（块内容为 .cast 的 public 绝对路径）。
// 设计要点：
// - 播放器走 public 下的自包含 UMD bundle，运行时注入 <script>/<link>，不经 webpack 打包，
//   规避 asciinema-player ESM 入口的 Web Worker 打包坑。
// - 仅当 cast 滚入视野时才注入加载(约 185KB)，无终端演示的页面零成本；同一页多个 cast 共享一次加载。
// - IntersectionObserver 触发即播一次(不循环)；命中「减少动态效果」时不自动播，留静态首帧+播放键。

const CSS_HREF = '/vendor/asciinema/asciinema-player.css'
const JS_SRC = '/vendor/asciinema/asciinema-player.min.js'

type AsciinemaGlobal = {
  create: (
    src: string,
    el: HTMLElement,
    opts?: Record<string, unknown>,
  ) => { dispose?: () => void }
}

declare global {
  interface Window {
    AsciinemaPlayer?: AsciinemaGlobal
  }
}

// 全局只注入一次脚本；返回的 Promise 在 window.AsciinemaPlayer 可用后 resolve
let jsPromise: Promise<void> | null = null

function ensureCss(): void {
  if (document.querySelector('link[data-asciinema="true"]')) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = CSS_HREF
  link.dataset.asciinema = 'true'
  document.head.appendChild(link)
}

function ensureJs(): Promise<void> {
  if (window.AsciinemaPlayer) return Promise.resolve()
  if (jsPromise) return jsPromise
  jsPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = JS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      jsPromise = null // 允许下次重试
      reject(new Error('asciinema 播放器加载失败'))
    }
    document.head.appendChild(script)
  })
  return jsPromise
}

interface Props {
  src: string
}

export function AsciinemaCast({ src }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let disposed = false
    let player: { dispose?: () => void } | null = null
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const mount = async () => {
      ensureCss()
      try {
        await ensureJs()
      } catch {
        return // 加载失败时静默留空容器，不阻塞页面其它内容
      }
      const player_api = window.AsciinemaPlayer
      if (disposed || !containerRef.current || !player_api) return
      player = player_api.create(src, containerRef.current, {
        autoPlay: !reduceMotion, // 尊重「减少动态效果」：此时不自动播，留静态首帧 + 播放键
        loop: false,
        terminalFontSize: '14px',
        theme: 'asciinema',
        idleTimeLimit: 2, // 把超过 2s 的等待压缩，节奏更紧凑
        poster: 'npt:0:0',
        controls: true,
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.disconnect()
            void mount()
            break
          }
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)

    return () => {
      disposed = true
      observer.disconnect()
      player?.dispose?.()
    }
  }, [src])

  return <div className="course-cast" ref={containerRef} aria-label="终端演示" />
}
