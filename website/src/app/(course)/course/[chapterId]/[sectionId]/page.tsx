import type { Metadata } from 'next'
import Link from 'next/link'

import { CourseMarkdown } from '@/features/course/components/CourseMarkdown'
import { loadSection } from '@/features/course/load-section'
import { resolveCourseImages } from '@/features/course/markdown-images'

interface Params {
  params: Promise<{ chapterId: string; sectionId: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { chapterId, sectionId } = await params
  const { current } = await loadSection(chapterId, sectionId)
  return { title: current.title }
}

export default async function SectionPage({ params }: Params) {
  const { chapterId, sectionId } = await params
  const { content, prev, next } = await loadSection(chapterId, sectionId)
  // 把 ![[...]] 维基嵌入与相对图片路径解析为 /courses/<chapterId>/... 站点绝对路径
  const source = resolveCourseImages(content, chapterId)

  return (
    <div className="mx-auto max-w-[800px] px-6">
      <CourseMarkdown source={source} />
      <nav className="mb-16 grid gap-3 border-t border-hairline pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/course/${prev.chapterId}/${prev.id}`}
            className="rounded-lg border border-hairline bg-surface px-4 py-3 transition-colors hover:border-hairline-strong"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">上一节</div>
            <div className="mt-1 text-[14px] text-ink-soft">← {prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/course/${next.chapterId}/${next.id}`}
            className="rounded-lg border border-hairline bg-surface px-4 py-3 text-right transition-colors hover:border-hairline-strong"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">下一节</div>
            <div className="mt-1 text-[14px] text-ink-soft">{next.title} →</div>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
