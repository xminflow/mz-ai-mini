'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { SidebarGroup } from './selectors'

type SceneSidebarProps = {
  groups: SidebarGroup[]
}

const ITEM_BASE = 'block py-1.5 text-[14px] leading-[1.6] transition-colors'

/**
 * 案例页的场景导航。用线加文字而不是卡片：侧栏是导航不是内容，
 * 给每一项加边框和底色会让它比右侧真正的内容还重。
 *
 * 不显示模板数量：这是一份「我们能做哪些类型的项目」的目录，不是库存清单。
 *
 * 移动端不折叠成横向选择条，仍是同一份纵向列表放在内容上方——
 * 两级结构横排会把一级分类的层次压掉，纵向列表反而更容易扫。
 */
export function SceneSidebar({ groups }: SceneSidebarProps) {
  const pathname = usePathname()

  const itemClass = (href: string) =>
    `${ITEM_BASE} ${pathname === href ? 'text-graphite' : 'text-graphite-soft hover:text-graphite'}`

  return (
    <nav aria-label="案例场景" className="lg:sticky lg:top-28 lg:w-52 lg:shrink-0 lg:self-start">
      <Link
        href="/cases"
        className={itemClass('/cases')}
        aria-current={pathname === '/cases' ? 'page' : undefined}
      >
        全部案例
      </Link>

      {groups.map((group) => (
        <div key={group.id} className="mt-6 border-t border-rule pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-graphite-dim">
            {group.name}
          </p>
          <div className="mt-2">
            {group.scenes.map((scene) => {
              const href = `/cases/${scene.id}`
              return (
                <Link
                  key={scene.id}
                  href={href}
                  className={itemClass(href)}
                  aria-current={pathname === href ? 'page' : undefined}
                >
                  {scene.name}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
