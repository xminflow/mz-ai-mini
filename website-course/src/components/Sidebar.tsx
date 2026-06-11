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
    <nav className="p-2">
      <div className="px-2 py-3 text-lg font-semibold text-gray-800">{manifest.title}</div>
      {manifest.chapters.map((ch) => {
        const isCollapsed = collapsed.has(ch.id) && ch.id !== chapterId
        return (
          <div key={ch.id} className="mb-1">
            <button
              type="button"
              onClick={() => toggle(ch.id)}
              className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="inline-block w-4 text-gray-400">{isCollapsed ? '▶' : '▼'}</span>
              {ch.title}
            </button>
            {!isCollapsed && (
              <ul className="ml-5 border-l border-gray-200">
                {ch.sections.map((s) => (
                  <li key={s.id}>
                    <NavLink
                      to={`/c/${ch.id}/s/${s.id}`}
                      className={({ isActive }) =>
                        `block rounded px-3 py-1.5 text-sm ${
                          isActive ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-100'
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
