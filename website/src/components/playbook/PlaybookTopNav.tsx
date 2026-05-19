'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { AuthState } from '@/features/auth/types'

export function PlaybookTopNav({ initialAuthState }: { initialAuthState: AuthState }) {
  const pathname = usePathname()
  const [authState, setAuthState] = useState<AuthState>(initialAuthState)
  const [loggingOut, setLoggingOut] = useState(false)

  // 同步服务端最新 authState：router.refresh() 后 layout 会重新拉取并把新对象传进来
  useEffect(() => {
    setAuthState(initialAuthState)
  }, [initialAuthState])

  const isMainPage = pathname === '/playbook'

  const loginHref = `/login?next=${encodeURIComponent(pathname)}`

  const accountLabel =
    authState.authenticated
      ? authState.account.email || authState.account.username || '已登录'
      : null

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setAuthState({ authenticated: false, reason: 'missing_session' })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#050507]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        {/* 左侧：主页链接 + 书名 */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-[#d6cfc4] transition-colors hover:border-[#b8693a]/60 hover:bg-[#8b2e2e]/25 hover:text-[#fffdf7] sm:text-[12.5px]"
            aria-label="返回微域生光官网首页"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">←</span>
            返回主页
          </Link>
          <Link
            href="/playbook"
            className="font-serif-zh truncate text-[17px] font-semibold tracking-[0.08em] text-[#fffdf7]"
          >
            微域生光自媒体运营实战
          </Link>
          <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8aa96] sm:inline">
            Creator Notes
          </span>
        </div>

        {/* 右侧：目录链接 + 登录状态 */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          {isMainPage ? (
            <a
              href="#toc"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8aa96] transition-colors hover:text-[#fffdf7] sm:text-[11px]"
            >
              目录
            </a>
          ) : (
            <Link
              href="/playbook#toc"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8aa96] transition-colors hover:text-[#fffdf7] sm:text-[11px]"
            >
              ← 目录
            </Link>
          )}

          {/* 登录状态 */}
          {accountLabel ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/account"
                className="max-w-[110px] truncate font-mono text-[10px] uppercase tracking-[0.18em] text-[#b8aa96] transition-colors hover:text-[#fffdf7] sm:text-[11px]"
              >
                {accountLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8aa96] transition-colors hover:text-[#fffdf7] disabled:opacity-50 sm:text-[11px]"
              >
                {loggingOut ? '退出中' : '退出'}
              </button>
            </div>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-[#d6cfc4] transition-colors hover:border-[#b8693a]/60 hover:bg-[#8b2e2e]/25 hover:text-[#fffdf7] sm:text-[12.5px]"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
