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

// 细巧折角箭头：展开时旋转 90°，平滑过渡
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 3 8 6 4.5 9" />
    </svg>
  )
}

// 细描边小锁，替代 emoji，风格统一
function LockIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      className="h-3.5 w-3.5 shrink-0 text-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.2" y="6.3" width="7.6" height="5" rx="1.2" />
      <path d="M4.8 6.3V4.7a2.2 2.2 0 0 1 4.4 0v1.6" />
    </svg>
  )
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
    <nav className="px-3 py-5">
      <div className="text-gradient px-2 pb-5 text-[15px] font-semibold tracking-tight">{data.title}</div>

      <div className="space-y-0.5">
        {data.chapters.map((ch) => {
          const isOpen = !(collapsed.has(ch.id) && ch.id !== currentChapterId)

          // 锁定章节：标题 + 描边小锁，引导升级；不下发小节链接
          if (ch.locked) {
            return (
              <Link
                key={ch.id}
                href="/membership"
                title="开通会员解锁"
                className="flex items-center gap-2 rounded-md px-2 py-2 text-[13px] font-medium text-muted/70 transition-colors hover:text-ink-soft"
              >
                <LockIcon />
                <span className="truncate">{ch.title}</span>
              </Link>
            )
          }

          return (
            <div key={ch.id}>
              <button
                type="button"
                onClick={() => toggle(ch.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                <Chevron open={isOpen} />
                <span className="truncate">{ch.title}</span>
              </button>

              {isOpen && (
                // 单条引导线（rail）+ 当前小节用实心圆点标在线上，路径观感
                <ul className="mb-1.5 ml-[15px] mt-0.5 border-l border-hairline">
                  {ch.sections.map((s) => {
                    const href = `/course/${ch.id}/${s.id}`
                    const isActive = sectionPath === href
                    return (
                      <li key={s.id} className="relative">
                        <span
                          className={`absolute -left-[3px] top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full ring-2 ring-surface transition-colors ${
                            isActive ? 'bg-accent' : 'bg-transparent ring-0'
                          }`}
                          aria-hidden="true"
                        />
                        <Link
                          href={href}
                          aria-current={isActive ? 'page' : undefined}
                          className={`block py-[7px] pl-5 pr-2 text-[13px] leading-snug transition-colors ${
                            isActive
                              ? 'font-medium text-accent'
                              : 'text-muted hover:text-ink-soft'
                          }`}
                        >
                          <span className="tabular-nums opacity-50">{s.id}</span> {s.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
