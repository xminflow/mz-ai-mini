import { redirect } from 'next/navigation'

import { loadManifest } from '@/features/course/load-manifest'
import { flattenSections } from '@/features/course/manifest'

// 进入课程首页时默认跳转到第一节；无内容时给出明确提示
export default async function CourseHomePage() {
  const manifest = await loadManifest('courses')
  const [first] = flattenSections(manifest)
  if (!first) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        暂无课程内容
      </div>
    )
  }
  redirect(`/course/${first.chapterId}/${first.id}`)
}
