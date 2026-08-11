'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui'
import { useContact } from './contact-context'

// 导航只放页面，不放页内锚点：首页本身就是一屏一屏滚下去的，锚点会让导航看起来比站点实际更复杂。
const NAV_ITEMS: Array<{ label: string; href: string }> = [
  { label: '首页', href: '/' },
  { label: '案例', href: '/cases' },
]

const LINK_CLASS = 'rounded-full px-4 py-1.5 text-[14px] transition-colors'

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
        className={[
          'transition-all duration-300',
          scrolled
            ? 'border-b border-rule bg-paper/80 backdrop-blur-xl'
            : 'border-b border-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo/weiyu-logo-web-dark.svg" alt="微域生光" className="h-9 w-9" />
            <span className="text-[15px] font-semibold tracking-tight text-graphite">微域生光</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${LINK_CLASS} ${
                  pathname === item.href ? 'text-graphite' : 'text-graphite-soft hover:text-graphite'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
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
            <Button onClick={openContact} className="px-4 py-2.5 text-[13px]">
              聊聊需求
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
