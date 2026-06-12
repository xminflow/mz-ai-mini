'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { AdjacentLink, Section } from '../types'

interface Props {
  current: Section
  prev: AdjacentLink | null
  next: AdjacentLink | null
}

// 右侧课程展示：顶部上/下一节导航条 + iframe 加载完整 HTML 文档
export function LessonViewer({ current, prev, next }: Props) {
  const router = useRouter()
  const [iframeError, setIframeError] = useState(false)
  const currentFile = current.file

  // iframe onError 对跨文档加载不可靠，这里用 HEAD 显式探测课程文件是否存在。
  // 依赖 currentFile 字符串，避免失败态触发无限重渲染。
  useEffect(() => {
    setIframeError(false)
    let alive = true
    fetch(`/courses/${currentFile}`, { method: 'HEAD' })
      .then((res) => {
        if (alive && !res.ok) setIframeError(true)
      })
      .catch(() => {
        if (alive) setIframeError(true)
      })
    return () => {
      alive = false
    }
  }, [currentFile])

  // 上/下一节胶囊按钮：发丝边框 + hover 紫色微光，禁用态弱化
  const navBtn =
    'rounded-full border border-hairline px-4 py-1.5 text-sm text-ink transition-all enabled:hover:border-hairline-strong enabled:hover:text-accent enabled:hover:shadow-[0_6px_20px_-6px_rgba(167,139,250,0.5)] disabled:border-transparent disabled:text-muted/40'

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-4 py-2.5 backdrop-blur-xl">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && router.push(`/course/${prev.chapterId}/${prev.sectionId}`)}
          className={navBtn}
        >
          ← 上一节
        </button>
        <span className="truncate px-3 text-sm font-medium text-ink-soft">
          {current.id} {current.title}
        </span>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && router.push(`/course/${next.chapterId}/${next.sectionId}`)}
          className={navBtn}
        >
          下一节 →
        </button>
      </div>
      <div className="relative flex-1 bg-canvas">
        {iframeError ? (
          <div className="flex h-full items-center justify-center text-accent-3">
            课程文件缺失：{current.file}
          </div>
        ) : (
          <iframe
            key={current.file}
            src={`/courses/${current.file}`}
            title={current.title}
            className="h-full w-full border-0 bg-canvas"
            onError={() => setIframeError(true)}
          />
        )}
      </div>
    </div>
  )
}
