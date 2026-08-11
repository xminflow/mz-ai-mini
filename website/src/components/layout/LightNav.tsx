'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui'
import { useContact } from './contact-context'

// 锚点一律写成绝对形式（/#services）：站内已有第二个页面，
// 写成 #services 时在非首页上会指向不存在的锚点。
type NavItem = {
  label: string
  href: string
  /** page 走 next/link 并参与当前页高亮；anchor 走原生 a，跨页哈希跳转需要整页导航 */
  kind: 'anchor' | 'page'
}

const NAV_ITEMS: NavItem[] = [
  { label: '服务', href: '/#services', kind: 'anchor' },
  { label: '优势', href: '/#why-us', kind: 'anchor' },
  { label: '服务模式', href: '/service-models', kind: 'page' },
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

  const pageItems = NAV_ITEMS.filter((item) => item.kind === 'page')

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
            {NAV_ITEMS.map((item) => {
              if (item.kind === 'page') {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${LINK_CLASS} ${active ? 'text-graphite' : 'text-graphite-soft hover:text-graphite'}`}
                  >
                    {item.label}
                  </Link>
                )
              }
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`${LINK_CLASS} text-graphite-soft hover:text-graphite`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* 移动端只留页面级入口 + CTA：锚点在窄屏上挤不下，且首页本身就能滚到 */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-3 md:hidden">
              {pageItems.map((item) => (
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
