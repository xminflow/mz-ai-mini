import { redirect } from 'next/navigation'

import { loadManifest } from '@/features/course/load-manifest'
import { flattenSections } from '@/features/course/manifest'

// 进入社区首页时默认跳转到第一篇内容；无内容时给出明确提示
export default async function CommunityHomePage() {
  const manifest = await loadManifest('community')
  const [first] = flattenSections(manifest)
  if (!first) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        暂无社区内容
      </div>
    )
  }
  redirect(`/community/${first.chapterId}/${first.id}`)
}
