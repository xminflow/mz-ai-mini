'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import type { ApiErrorPayload, AuthState } from '@/features/auth/types'
import { LightShell } from '@/components/layout/LightShell'
import { Button, Card } from '@/components/ui'
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
      // 跳转目标页会重新校验会话；立即 refresh 会与 replace 竞争，可能刷新回登录页。
      router.replace(nextPath)
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
    <LightShell glow="none" className="home-typography home-redesign">
    <section aria-labelledby="login-heading" className="mx-auto flex min-h-[calc(100svh-14rem)] w-full max-w-6xl items-center px-4 py-12 sm:px-6 sm:py-20">
      <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue">
            Weelume Account
          </p>
          <h1 id="login-heading" className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-graphite sm:text-5xl">
            欢迎回到<br />微域生光
          </h1>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-graphite-soft">
            用微信扫一扫，关注公众号即可登录。
          </p>
          <Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-btn py-2 text-sm text-graphite-soft transition-colors hover:text-blue focus-visible:outline-2 focus-visible:outline-blue">
            <span aria-hidden="true">←</span> 返回首页
          </Link>
        </div>

        <Card className="w-full max-w-md justify-self-center border border-rule lg:justify-self-end" padClass="p-6 sm:p-10">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-graphite">微信扫码登录</h2>
            <p className="mt-2 text-sm text-graphite-soft">打开微信，扫描下方二维码</p>
          </div>
          <WechatLoginPanel onSuccess={handleLoginSuccess} />
          <p className="mt-6 border-t border-rule pt-5 text-center text-xs leading-relaxed text-graphite-dim">
            首次扫码关注后将自动创建账号，已关注用户直接扫码即可。
          </p>

          {IS_DEV_BUILD && (
            <details className="mt-5 rounded-btn border border-dashed border-rule bg-paper p-3">
              <summary className="cursor-pointer text-xs text-graphite-soft">
                dev only · 本地快捷登录
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-graphite-dim">
                绕过微信扫码，按 username 直接拿 token（仅本地开发可用）。
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={devUsername}
                  onChange={(e) => setDevUsername(e.target.value)}
                  placeholder="dev_local"
                  aria-label="本地开发用户名"
                  className="h-10 min-w-0 flex-1 rounded-btn border border-rule bg-paper-raised px-3 text-sm text-graphite placeholder:text-graphite-dim focus:outline-2 focus:outline-blue"
                  disabled={devPending}
                />
                <Button
                  onClick={handleDevLogin}
                  disabled={devPending || devUsername.trim() === ''}
                  className="shrink-0 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {devPending ? '登录中...' : '本地登录'}
                </Button>
              </div>
              {devError !== null && (
                <p role="alert" className="mt-2 text-xs text-red-700">{devError}</p>
              )}
            </details>
          )}
        </Card>
      </div>
    </section>
    </LightShell>
  )
}
