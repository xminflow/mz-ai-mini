import type { ReactNode } from 'react'

import { LightShell } from '@/components/layout/LightShell'
import { SceneSidebar } from '@/features/site-templates/gallery/SceneSidebar'
import { getSidebarNav } from '@/features/site-templates/gallery/selectors'
import { SITE_TEMPLATES } from '@/features/site-templates/registry'

// 左侧栏放在 layout 而不是各页面里：切换场景时侧栏不重新挂载，滚动位置与高亮态都稳定。
export default function CasesLayout({ children }: { children: ReactNode }) {
  return (
    <LightShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-16 sm:px-6 lg:flex-row lg:gap-16 lg:pt-24">
        <SceneSidebar groups={getSidebarNav()} totalCount={SITE_TEMPLATES.length} />
        {/* min-w-0：不加的话内部网格的最小内容宽度会把 flex 项撑破，右侧溢出容器 */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </LightShell>
  )
}
