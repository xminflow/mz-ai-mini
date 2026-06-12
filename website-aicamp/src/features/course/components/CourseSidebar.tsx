'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import type { SidebarData } from '../types'

interface Props {
  data: SidebarData
}

// 从 /course/<chapterId>/<sectionId> 解析当前定位
function useCurrentLocation(): { chapterId: string | null; sectionPath: string } {
  const pathname = usePathname()
  const m = pathname.match(/^\/course\/([^/]+)\/([^/]+)/)
  return { chapterId: m?.[1] ?? null, sectionPath: pathname }
}

export function CourseSidebar({ data }: Props) {
  const { chapterId: currentChapterId, sectionPath } = useCurrentLocation()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    if (id === currentChapterId) return // 当前所在章节始终展开
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <nav className="p-3">
      <div className="text-gradient px-2 py-4 text-lg font-semibold tracking-tight">{data.title}</div>
      {data.chapters.map((ch) => {
        const isCollapsed = collapsed.has(ch.id) && ch.id !== currentChapterId
        return (
          <div key={ch.id} className="mb-1">
            {ch.locked ? (
              // 锁定章节：标题 + 🔒，引导升级；不下发小节链接
              <Link
                href="/membership"
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-ink-soft"
              >
                <span className="inline-block w-4">🔒</span>
                {ch.title}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => toggle(ch.id)}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-white/5 hover:text-ink"
                >
                  <span className="inline-block w-4 text-muted">{isCollapsed ? '▶' : '▼'}</span>
                  {ch.title}
                </button>
                {!isCollapsed && (
                  <ul className="ml-[18px] border-l border-hairline">
                    {ch.sections.map((s) => {
                      const href = `/course/${ch.id}/${s.id}`
                      const isActive = sectionPath === href
                      return (
                        <li key={s.id}>
                          <Link
                            href={href}
                            className={`-ml-px block border-l-2 px-3 py-1.5 text-sm transition-colors ${
                              isActive
                                ? 'border-accent bg-accent/10 font-medium text-accent'
                                : 'border-transparent text-muted hover:bg-white/5 hover:text-ink-soft'
                            }`}
                          >
                            {s.id} {s.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}
