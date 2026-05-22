'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import type { ApiErrorPayload, AuthState } from '@/features/auth/types'
import { WechatLoginPanel } from './WechatLoginPanel'

const IS_DEV_BUILD = process.env.NODE_ENV !== 'production'

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  if (value.startsWith('/login')) return '/'
  return value
}

type DevLoginResponse = { state: AuthState }

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'error' in value &&
    typeof (value as ApiErrorPayload).error?.message === 'string'
  )
}

export function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = useMemo(() => normalizeNextPath(searchParams.get('next')), [searchParams])

  const [devUsername, setDevUsername] = useState('dev_local')
  const [devPending, setDevPending] = useState(false)
  const [devError, setDevError] = useState<string | null>(null)

  const handleLoginSuccess = (state: AuthState) => {
    if (state.authenticated) {
      router.replace(nextPath)
      router.refresh()
    }
  }

  const handleDevLogin = async () => {
    setDevPending(true)
    setDevError(null)
    try {
      const resp = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: devUsername }),
      })
      if (!resp.ok) {
        const body = (await resp.json().catch(() => null)) as unknown
        const message = isApiErrorPayload(body) ? body.error.message : '本地登录失败，请检查后端是否启动'
        setDevError(message)
        return
      }
      const { state } = (await resp.json()) as DevLoginResponse
      handleLoginSuccess(state)
    } catch {
      setDevError('本地登录请求异常，请稍后重试')
    } finally {
      setDevPending(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center px-4 py-16 sm:px-6">
      <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-2">
            Weelume Account
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            登录微域生光账号
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            扫码关注公众号即可登录；登录后可在个人信息中绑定邮箱与修改用户名。
          </p>
        </div>

        <div className="rounded-[8px] border border-hairline bg-surface/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
          <WechatLoginPanel onSuccess={handleLoginSuccess} />

          {IS_DEV_BUILD && (
            <div className="mt-5 rounded-[6px] border border-dashed border-hairline bg-surface/40 p-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted">
                dev only · 本地快捷登录
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                绕过微信扫码，按 username 直接拿 token（仅本地开发可用）。
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={devUsername}
                  onChange={(e) => setDevUsername(e.target.value)}
                  placeholder="dev_local"
                  className="h-9 flex-1 rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-2"
                  disabled={devPending}
                />
                <button
                  type="button"
                  onClick={handleDevLogin}
                  disabled={devPending || devUsername.trim() === ''}
                  className="inline-flex h-9 items-center rounded-[6px] border border-hairline bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {devPending ? '登录中...' : '本地登录'}
                </button>
              </div>
              {devError !== null && (
                <p className="mt-2 text-xs text-red-100">{devError}</p>
              )}
            </div>
          )}

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
