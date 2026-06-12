import Link from 'next/link'

import type { AdjacentLink, Section, SectionContent } from '../types'

interface Props {
  current: Section
  prev: AdjacentLink | null
  next: AdjacentLink | null
  content: SectionContent | null
}

// 上/下一节胶囊按钮：发丝边框 + hover 紫色微光
const navBtn =
  'rounded-full border border-hairline px-4 py-1.5 text-sm text-ink transition-all hover:border-hairline-strong hover:text-accent hover:shadow-[0_6px_20px_-6px_rgba(167,139,250,0.5)]'
// 禁用态（首/末节）：弱化、不可点
const navBtnDisabled =
  'pointer-events-none rounded-full border border-transparent px-4 py-1.5 text-sm text-muted/40'

// 右侧课程展示：顶部上/下一节导航条 + 原生内联渲染作用域化课程内容（替代 iframe）
export function LessonViewer({ current, prev, next, content }: Props) {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-4 py-2.5 backdrop-blur-xl">
        {prev ? (
          <Link href={`/course/${prev.chapterId}/${prev.sectionId}`} className={navBtn}>
            ← 上一节
          </Link>
        ) : (
          <span className={navBtnDisabled}>← 上一节</span>
        )}
        <span className="truncate px-3 text-sm font-medium text-ink-soft">
          {current.id} {current.title}
        </span>
        {next ? (
          <Link href={`/course/${next.chapterId}/${next.sectionId}`} className={navBtn}>
            下一节 →
          </Link>
        ) : (
          <span className={navBtnDisabled}>下一节 →</span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {content ? (
          <>
            {/* 作用域已限定到 .course-doc，内容为第一方自有 HTML，innerHTML 不执行脚本 */}
            <style dangerouslySetInnerHTML={{ __html: content.css }} />
            <article className="course-doc" dangerouslySetInnerHTML={{ __html: content.html }} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-accent-3">
            课程文件缺失：{current.file}
          </div>
        )}
      </div>
    </div>
  )
}
