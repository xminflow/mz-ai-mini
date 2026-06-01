'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 「提问」由右侧 CTA 按钮承载，导航项不再重复列出
const NAV_LINKS = [
  { label: '首页', to: '/' },
  { label: '标签', to: '/tags' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="bg-fusion glow-amber grid h-8 w-8 place-items-center rounded-xl text-sm font-semibold text-white">
            知
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-ink">知识汇</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                href={link.to}
                className={`rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/8 text-ink' : 'text-mute hover:text-ink hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <Link href="/new" className="btn-fusion ml-2 px-4 py-1.5 text-sm font-semibold">
            提问
          </Link>
        </nav>
      </div>
    </header>
  )
}
