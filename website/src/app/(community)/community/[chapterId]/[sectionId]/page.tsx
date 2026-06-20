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
  const { current } = await loadSection('community', chapterId, sectionId)
  return { title: current.title }
}

export default async function CommunitySectionPage({ params }: Params) {
  const { chapterId, sectionId } = await params
  const { content, prev, next } = await loadSection('community', chapterId, sectionId)
  // 把 ![[...]] 维基嵌入与相对图片路径解析为 /community/<chapterId>/... 站点绝对路径
  const source = resolveCourseImages(content, chapterId, 'community')

  return (
    <div className="mx-auto max-w-[800px] px-6">
      <CourseMarkdown source={source} />
      <nav className="mb-16 grid gap-3 border-t border-hairline pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/community/${prev.chapterId}/${prev.id}`}
            className="rounded-lg border border-hairline bg-surface px-4 py-3 transition-colors hover:border-hairline-strong"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">上一篇</div>
            <div className="mt-1 text-[14px] text-ink-soft">← {prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/community/${next.chapterId}/${next.id}`}
            className="rounded-lg border border-hairline bg-surface px-4 py-3 text-right transition-colors hover:border-hairline-strong"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">下一篇</div>
            <div className="mt-1 text-[14px] text-ink-soft">{next.title} →</div>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
