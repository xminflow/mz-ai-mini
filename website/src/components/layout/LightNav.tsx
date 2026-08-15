'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui'
import { useContact } from './contact-context'

// 导航只放页面，不放页内锚点：首页本身就是一屏一屏滚下去的，锚点会让导航看起来比站点实际更复杂。
//
// 目前为空：全站只有首页对外开放（白名单见 middleware.ts），唯一能放的「首页」既指向访客
// 当前所在的页面，又与左上角 logo 重复，留着只是占位。恢复板块时把它的入口填回本数组即可，
// 下面桌面/窄屏两套渲染逻辑都保留未删。
const NAV_ITEMS: Array<{ label: string; href: string }> = []

const LINK_CLASS = 'rounded-btn px-4 py-1.5 text-[14px] transition-colors'

export const LightNav = () => {
  const pathname = usePathname()
  const { openContact } = useContact()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-30 w-full">
      <div
        // 玻璃只在滚动后出现：停在顶部时导航压着的是首屏留白，做成玻璃只会凭空
        // 多出一条横带。glass-medium 自带四周描边，但这是一条通栏，只有下缘该留线，
        // 左右和上缘用内联样式压掉——同为 utility 的 border-x-0 与 glass-medium
        // 处在同一层，谁覆盖谁取决于生成顺序，不可靠，内联样式才是确定的
        className={[
          'transition-all duration-300',
          scrolled ? 'glass-medium' : 'border-b border-transparent',
        ].join(' ')}
        style={scrolled ? { borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 } : undefined}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo/weiyu-logo-web-dark.svg" alt="微域生光" className="h-9 w-9" />
            <span className="text-[15px] font-semibold tracking-tight text-graphite">微域生光</span>
          </Link>

          {/* 数组为空时整个 nav 不渲染：空的 nav 是个没有内容的导航地标，
              读屏会念出来，DOM 里也留着一个撑不起任何东西的 flex 容器 */}
          {NAV_ITEMS.length > 0 && (
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${LINK_CLASS} ${
                    pathname === item.href
                      ? 'text-graphite'
                      : 'text-graphite-soft hover:text-graphite'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {NAV_ITEMS.length > 0 && (
              <nav className="flex items-center gap-3.5 md:hidden">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'text-[13px] transition-colors',
                      pathname === item.href ? 'text-graphite' : 'text-graphite-soft',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
            <Button onClick={openContact} className="px-4 py-2.5 text-[13px]">
              联系我们
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
