'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import type { AuthState } from '@/features/auth/types'
import { WechatLoginPanel } from './WechatLoginPanel'

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  if (value.startsWith('/login')) return '/'
  return value
}

export function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = useMemo(() => normalizeNextPath(searchParams.get('next')), [searchParams])

  const handleLoginSuccess = (state: AuthState) => {
    if (state.authenticated) {
      router.replace(nextPath)
      router.refresh()
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center px-4 py-16 sm:px-6">
      <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-2">
            Weelume Camp
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            登录微域生光账号
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            扫码关注微信公众号即可登录；登录后可在个人信息中绑定邮箱与修改用户名。
          </p>
        </div>

        <div className="rounded-[8px] border border-hairline bg-surface/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
          <WechatLoginPanel onSuccess={handleLoginSuccess} />

          <Link
            href="/"
            className="mt-5 inline-flex text-sm text-muted transition-colors hover:text-ink"
          >
            返回首页
          </Link>
        </div>
      </div>
    </section>
  )
}
