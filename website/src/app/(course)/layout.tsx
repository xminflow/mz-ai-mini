import 'katex/dist/katex.min.css'

import { TopNav } from '@/components/layout/TopNav'
import { getWebsiteAuthState } from '@/features/auth/server/session'
import { CourseSidebar } from '@/features/course/components/CourseSidebar'
import { loadSidebar } from '@/features/course/load-section'

// 课程页依赖登录态，强制动态渲染
export const dynamic = 'force-dynamic'

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const authState = await getWebsiteAuthState()
  const sidebar = await loadSidebar()

  // 顶栏 sticky 高度 h-14/sm:h-16，课程区占满其下视口，侧栏与正文各自独立滚动
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav initialAuthState={authState} />
      <div className="flex h-[calc(100vh-3.5rem)] min-h-0 sm:h-[calc(100vh-4rem)]">
        <aside className="scrollbar-thin w-72 shrink-0 overflow-y-auto border-r border-hairline bg-canvas">
          <CourseSidebar data={sidebar} />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto bg-canvas">{children}</main>
      </div>
    </div>
  )
}
