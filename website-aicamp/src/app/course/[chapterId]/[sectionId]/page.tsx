import { notFound, redirect } from 'next/navigation'

import { getCampAuthState } from '@/features/auth/server/session'
import { canAccessChapter } from '@/features/course/access'
import { loadManifest } from '@/features/course/load-manifest'
import { loadLesson } from '@/features/course/load-lesson'
import { findAdjacent, flattenSections } from '@/features/course/manifest'
import { LessonViewer } from '@/features/course/components/LessonViewer'
import type { AdjacentLink } from '@/features/course/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ chapterId: string; sectionId: string }>
}

export default async function LessonPage({ params }: PageProps) {
  const { chapterId, sectionId } = await params
  const manifest = await loadManifest()

  const chapter = manifest.chapters.find((c) => c.id === chapterId)
  if (!chapter) {
    notFound()
  }

  // 只读渲染上下文：禁止轮换一次性 token。access 过期时跳到可写续签端点自愈并跳回本节，绝不在此处轮换丢失。
  const authState = await getCampAuthState({ readonly: true })
  // 'reason' in 收窄到未登录分支（tsconfig strict:false 下负向收窄不可靠，用 in 守卫）
  if ('reason' in authState && authState.reason === 'needs_refresh') {
    redirect(`/api/auth/refresh?next=${encodeURIComponent(`/course/${chapterId}/${sectionId}`)}`)
  }
  const account = authState.authenticated ? authState.account : null
  if (!canAccessChapter(account, chapter.tier)) {
    redirect('/membership')
  }

  const flat = flattenSections(manifest)
  const { prev, current, next } = findAdjacent(flat, chapterId, sectionId)
  if (!current) {
    notFound()
  }

  const prevLink: AdjacentLink | null = prev ? { chapterId: prev.chapterId, sectionId: prev.id } : null
  const nextLink: AdjacentLink | null = next ? { chapterId: next.chapterId, sectionId: next.id } : null

  // 按 file 键动态加载课件 TSX 组件；缺失 → 显示缺失提示（保留导航）
  const Lesson = await loadLesson(current.file)

  return (
    <LessonViewer
      current={{ id: current.id, title: current.title, file: current.file }}
      prev={prevLink}
      next={nextLink}
    >
      {Lesson ? <Lesson /> : <p className="text-accent-3">课件缺失：{current.file}</p>}
    </LessonViewer>
  )
}
