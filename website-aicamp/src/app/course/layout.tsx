import { redirect } from 'next/navigation'

import { getCampAuthState } from '@/features/auth/server/session'
import { requireTier } from '@/features/membership/require-tier'
import { COURSE_MIN_TIER, canAccessChapter } from '@/features/course/access'
import { CourseSidebar } from '@/features/course/components/CourseSidebar'
import { LessonToc } from '@/features/course/components/LessonToc'
import { loadManifest } from '@/features/course/load-manifest'
import type { SidebarData } from '@/features/course/types'

// 课程页依赖登录态，强制动态渲染（与 /membership 一致）
export const dynamic = 'force-dynamic'

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const authState = await getCampAuthState()
  const account = authState.authenticated ? authState.account : null

  // 未登录由 middleware 拦到 /login；此处拦非会员（已登录但未达最低门槛）
  if (!requireTier(account, COURSE_MIN_TIER)) {
    redirect('/membership')
  }

  const manifest = await loadManifest()
  const sidebar: SidebarData = {
    title: manifest.title,
    chapters: manifest.chapters.map((ch) => {
      const accessible = canAccessChapter(account, ch.tier)
      return {
        id: ch.id,
        title: ch.title,
        locked: !accessible,
        // 锁定章节不下发小节
        sections: accessible ? ch.sections.map((s) => ({ id: s.id, title: s.title })) : [],
      }
    }),
  }

  // 顶栏 sticky 高度 h-14/sm:h-16，课程区占满其下视口，侧栏与正文各自独立滚动
  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 sm:h-[calc(100vh-4rem)]">
      <aside className="scrollbar-thin w-72 shrink-0 overflow-y-auto bg-canvas">
        <CourseSidebar data={sidebar} />
      </aside>
      <div className="min-w-0 flex-1 overflow-hidden">{children}</div>
      {/* 右栏：本节文章目录，镜像左侧课程栏（窄屏隐藏以保阅读宽度） */}
      <aside className="scrollbar-thin hidden w-72 shrink-0 overflow-y-auto bg-canvas xl:block">
        <LessonToc />
      </aside>
    </div>
  )
}
