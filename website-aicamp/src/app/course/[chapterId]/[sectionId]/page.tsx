import { notFound, redirect } from 'next/navigation'

import { getCampAuthState } from '@/features/auth/server/session'
import { canAccessChapter } from '@/features/course/access'
import { loadManifest } from '@/features/course/load-manifest'
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

  // 章级门禁：当前账号等级不满足该章 tier → 跳开通会员
  const authState = await getCampAuthState()
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

  return (
    <LessonViewer
      current={{ id: current.id, title: current.title, file: current.file }}
      prev={prevLink}
      next={nextLink}
    />
  )
}
