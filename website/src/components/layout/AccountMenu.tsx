'use client'

import Link from 'next/link'

import type { AuthState } from '@/features/auth/types'

export function AccountMenu({
  authState,
  loggingOut,
  onLogout,
}: {
  authState: AuthState
  loggingOut: boolean
  onLogout: () => void
}) {
  if (!authState.authenticated) return null

  const label = authState.account.email || authState.account.username || '已登录'

  return (
    <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5">
      <Link
        href="/course"
        className="text-[13px] text-ink-soft transition-colors hover:text-ink"
      >
        我的课程
      </Link>
      <span aria-hidden className="h-3 w-px bg-hairline" />
      <Link
        href="/account"
        className="max-w-[150px] truncate text-[13px] text-ink-soft transition-colors hover:text-ink"
      >
        {label}
      </Link>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="text-[13px] text-muted transition-colors hover:text-ink disabled:opacity-50"
      >
        {loggingOut ? '退出中' : '退出'}
      </button>
    </div>
  )
}
