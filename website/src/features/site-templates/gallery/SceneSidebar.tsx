'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { SidebarGroup } from './selectors'

type SceneSidebarProps = {
  groups: SidebarGroup[]
  totalCount: number
}

const ITEM_BASE =
  'flex items-baseline justify-between gap-3 py-1.5 text-[14px] leading-[1.6] transition-colors'

/**
 * 案例页的场景导航。用线加文字而不是卡片：侧栏是导航不是内容，
 * 给每一项加边框和底色会让它比右侧真正的模板还重。
 *
 * 移动端不折叠成横向选择条，仍是同一份纵向列表放在内容上方——
 * 当前可点项只有四个，横向滚动条是给不存在的规模做设计。
 */
export function SceneSidebar({ groups, totalCount }: SceneSidebarProps) {
  const pathname = usePathname()

  const itemClass = (href: string) =>
    `${ITEM_BASE} ${pathname === href ? 'text-graphite' : 'text-graphite-soft hover:text-graphite'}`

  return (
    <nav
      aria-label="案例场景"
      className="lg:sticky lg:top-28 lg:w-52 lg:shrink-0 lg:self-start"
    >
      <Link
        href="/cases"
        className={itemClass('/cases')}
        aria-current={pathname === '/cases' ? 'page' : undefined}
      >
        <span>全部模板</span>
        <span className="text-[12.5px] text-graphite-dim">{totalCount}</span>
      </Link>

      {groups.map((group) => (
        <div key={group.id} className="mt-6 border-t border-rule pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-graphite-dim">
            {group.name}
          </p>
          <div className="mt-2">
            {group.scenes.map((scene) => (
              <Link
                key={scene.id}
                href={`/cases/${scene.id}`}
                className={itemClass(`/cases/${scene.id}`)}
                aria-current={pathname === `/cases/${scene.id}` ? 'page' : undefined}
              >
                <span>{scene.name}</span>
                <span className="text-[12.5px] text-graphite-dim">{scene.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 border-t border-rule pt-4">
        <Link
          href="/cases/other"
          className={itemClass('/cases/other')}
          aria-current={pathname === '/cases/other' ? 'page' : undefined}
        >
          <span>其他场景</span>
        </Link>
      </div>
    </nav>
  )
}
