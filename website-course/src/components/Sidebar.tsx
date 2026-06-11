import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import type { Manifest } from '../types'

interface Props {
  manifest: Manifest
}

// 侧边目录：章节可折叠/展开，小节为路由链接；默认展开当前小节所在章节
export default function Sidebar({ manifest }: Props) {
  const { chapterId } = useParams()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    if (id === chapterId) return // 当前所在章节始终展开，点击其标题不改变折叠状态
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <nav className="p-3">
      <div className="text-gradient px-2 py-4 text-lg font-semibold tracking-tight">{manifest.title}</div>
      {manifest.chapters.map((ch) => {
        const isCollapsed = collapsed.has(ch.id) && ch.id !== chapterId
        return (
          <div key={ch.id} className="mb-1">
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
                {ch.sections.map((s) => (
                  <li key={s.id}>
                    <NavLink
                      to={`/c/${ch.id}/s/${s.id}`}
                      className={({ isActive }) =>
                        `-ml-px block border-l-2 px-3 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'border-accent bg-accent/10 font-medium text-accent'
                            : 'border-transparent text-muted hover:bg-white/5 hover:text-ink-soft'
                        }`
                      }
                    >
                      {s.id} {s.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
