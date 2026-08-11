'use client'

import { useEffect, useState } from 'react'

import { Button } from './ui'

// 单页站的导航即页内锚点。无登录入口——登录已随其他板块一并隐藏。
const ANCHORS: Array<{ label: string; href: string }> = [
  { label: '服务', href: '#services' },
  { label: '优势', href: '#why-us' },
  { label: '流程', href: '#process' },
]

type HomeNavProps = {
  onContact: () => void
}

export const HomeNav = ({ onContact }: HomeNavProps) => {
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
          <a href="#top" className="flex items-center gap-2">
            <img src="/logo/weiyu-logo-web-dark.svg" alt="微域生光" className="h-9 w-9" />
            <span className="text-[15px] font-semibold tracking-tight text-graphite">微域生光</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-1.5 text-[14px] text-graphite-soft transition-colors hover:text-graphite"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button onClick={onContact} className="px-4 py-2.5 text-[13px]">
            聊聊需求
          </Button>
        </div>
      </div>
    </header>
  )
}
