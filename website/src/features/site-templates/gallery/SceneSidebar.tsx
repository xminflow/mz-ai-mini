'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { SidebarScene } from './selectors'

type SceneSidebarProps = {
  scenes: SidebarScene[]
}

const ITEM_BASE = 'block py-1.5 text-[14px] leading-[1.6] transition-colors'

/**
 * 案例页的场景导航。用线加文字而不是卡片：侧栏是导航不是内容，
 * 给每一项加边框和底色会让它比右侧真正的内容还重。
 *
 * 一层扁平清单，不分组也不显示模板数量：这是一份「我们能做哪些类型的项目」的目录，
 * 客户是按「我要做个进销存」来找的，中间隔一层产品形态只会多一次翻找。
 *
 * 移动端不折叠成横向选择条，仍是同一份纵向列表放在内容上方。
 */
export function SceneSidebar({ scenes }: SceneSidebarProps) {
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

      <div className="mt-4 border-t border-rule pt-4">
        {scenes.map((scene) => {
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
    </nav>
  )
}
