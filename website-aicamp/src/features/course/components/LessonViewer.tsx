import Link from 'next/link'
import type { ReactNode } from 'react'

import type { AdjacentLink, Section } from '../types'

interface Props {
  current: Section
  prev: AdjacentLink | null
  next: AdjacentLink | null
  children: ReactNode
}

const navBtn =
  'rounded-full border border-hairline px-4 py-1.5 text-sm text-ink transition-all hover:border-hairline-strong hover:text-accent hover:shadow-[0_6px_20px_-6px_rgba(167,139,250,0.5)]'
const navBtnDisabled =
  'pointer-events-none rounded-full border border-transparent px-4 py-1.5 text-sm text-muted/40'

// 课程展示壳：上/下节导航 + 可滚动阅读区；课件组件作为 children 原生渲染
export function LessonViewer({ current, prev, next, children }: Props) {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-4 py-2.5 backdrop-blur-xl">
        {prev ? (
          <Link href={`/course/${prev.chapterId}/${prev.sectionId}`} className={navBtn}>← 上一节</Link>
        ) : (
          <span className={navBtnDisabled}>← 上一节</span>
        )}
        <span className="truncate px-3 text-sm font-medium text-ink-soft">{current.id} {current.title}</span>
        {next ? (
          <Link href={`/course/${next.chapterId}/${next.sectionId}`} className={navBtn}>下一节 →</Link>
        ) : (
          <span className={navBtnDisabled}>下一节 →</span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* 统一阅读栏：居中、最大宽度、留白（对应原 body 排版） */}
        <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8">{children}</article>
      </div>
    </div>
  )
}
