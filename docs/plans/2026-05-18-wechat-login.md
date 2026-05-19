# 官网微信扫码登录改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将官网登录页改造为微信扫码关注为主入口、邮箱登录折叠为次选项。

**Architecture:** 拆分 `WechatLoginPanel`（二维码状态机）和 `EmailLoginPanel`（现有邮箱逻辑）两个子组件，`LoginContent` 改为纯组合层；三个新 Next.js API 路由代理后端已有微信登录接口；`features/auth/server/backend.ts` 新增三个复用 `requestUpstream` 的函数。后端无需改动。

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS

**前置条件：**
- 本地 `.env.local`（或生产环境变量）需配置 `NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID=<公众号__biz值>`，用于移动端「在微信中打开」链接。未配置时移动端回退显示二维码图片。
- 后端微信官方账号配置（`wechat_official_appid` 等）需已就绪，否则二维码接口返回错误。

---

### Task 1: 扩展类型定义

**Files:**
- Modify: `website/src/features/auth/types.ts`

- [ ] **Step 1: 在 `types.ts` 末尾追加两个类型**

```typescript
export type WechatLoginSession = {
  login_session_id: string
  qr_code_url: string
  expires_at: string
  poll_interval_ms: number
}

export type WechatLoginSessionStatus = {
  login_session_id: string
  status: 'pending' | 'authenticated' | 'consumed' | 'expired'
  expires_at: string
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add website/src/features/auth/types.ts
git commit -m "feat(website): add wechat login session types"
```

---

### Task 2: 在 backend.ts 新增微信登录 API 函数

**Files:**
- Modify: `website/src/features/auth/server/backend.ts`

- [ ] **Step 1: 在 import 语句中追加新类型**

将第 1 行改为：

```typescript
import type { AuthAccount, AuthPayload, EmailLoginChallenge, WechatLoginSession, WechatLoginSessionStatus } from '../types'
```

- [ ] **Step 2: 在文件末尾（`getCurrentAccount` 之后）追加三个 upstream 类型和三个函数**

```typescript
type UpstreamWechatLoginSession = {
  login_session_id?: unknown
  qr_code_url?: unknown
  expires_at?: unknown
  poll_interval_ms?: unknown
}

type UpstreamWechatLoginSessionStatus = {
  login_session_id?: unknown
  status?: unknown
  expires_at?: unknown
}

export async function createWechatLoginSession(): Promise<WechatLoginSession> {
  const payload = await requestUpstream<UpstreamWechatLoginSession>(
    '/agent-auth/wechat-official/login-sessions',
    { method: 'POST', body: '{}' },
  )
  return {
    login_session_id: asString(payload.login_session_id),
    qr_code_url: asString(payload.qr_code_url),
    expires_at: asString(payload.expires_at),
    poll_interval_ms:
      typeof payload.poll_interval_ms === 'number' && Number.isFinite(payload.poll_interval_ms)
        ? payload.poll_interval_ms
        : 2000,
  }
}

export async function getWechatLoginSession(loginSessionId: string): Promise<WechatLoginSessionStatus> {
  const payload = await requestUpstream<UpstreamWechatLoginSessionStatus>(
    `/agent-auth/wechat-official/login-sessions/${loginSessionId}`,
    { method: 'GET' },
  )
  const raw = asString(payload.status)
  const status: WechatLoginSessionStatus['status'] =
    raw === 'authenticated' || raw === 'consumed' || raw === 'expired' ? raw : 'pending'
  return {
    login_session_id: asString(payload.login_session_id),
    status,
    expires_at: asString(payload.expires_at),
  }
}

export async function exchangeWechatLogin(loginSessionId: string): Promise<AuthPayload> {
  const payload = await requestUpstream<UpstreamAuthPayload>(
    `/agent-auth/wechat-official/login-sessions/${loginSessionId}/exchange`,
    { method: 'POST', body: '{}' },
  )
  return normalizeAuthPayload(payload)
}
```

- [ ] **Step 3: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 4: Commit**

```bash
git add website/src/features/auth/server/backend.ts
git commit -m "feat(website): add wechat login backend API functions"
```

---

### Task 3: 创建 POST /api/auth/wechat-login/sessions 路由

**Files:**
- Create: `website/src/app/api/auth/wechat-login/sessions/route.ts`

- [ ] **Step 1: 创建文件**

```typescript
import { NextResponse } from 'next/server'

import { createWechatLoginSession } from '@/features/auth/server/backend'
import { authErrorResponse } from '../../_shared'

export async function POST() {
  try {
    const session = await createWechatLoginSession()
    return NextResponse.json({ session })
  } catch (error) {
    return authErrorResponse(error)
  }
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add website/src/app/api/auth/wechat-login/sessions/route.ts
git commit -m "feat(website): add wechat login create session API route"
```

---

### Task 4: 创建 GET /api/auth/wechat-login/sessions/[sessionId] 路由

**Files:**
- Create: `website/src/app/api/auth/wechat-login/sessions/[sessionId]/route.ts`

- [ ] **Step 1: 创建文件**

```typescript
import { NextResponse } from 'next/server'

import { getWechatLoginSession } from '@/features/auth/server/backend'
import { authErrorResponse } from '../../../_shared'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  try {
    const status = await getWechatLoginSession(sessionId)
    return NextResponse.json({ status })
  } catch (error) {
    return authErrorResponse(error)
  }
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add "website/src/app/api/auth/wechat-login/sessions/[sessionId]/route.ts"
git commit -m "feat(website): add wechat login poll session status API route"
```

---

### Task 5: 创建 POST /api/auth/wechat-login/sessions/[sessionId]/exchange 路由

**Files:**
- Create: `website/src/app/api/auth/wechat-login/sessions/[sessionId]/exchange/route.ts`

- [ ] **Step 1: 创建文件**

```typescript
import { NextResponse } from 'next/server'

import { exchangeWechatLogin } from '@/features/auth/server/backend'
import { toAuthenticatedState, writeAuthCookies } from '@/features/auth/server/cookies'
import { authErrorResponse } from '../../../../_shared'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function POST(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  try {
    const payload = await exchangeWechatLogin(sessionId)
    await writeAuthCookies(payload)
    return NextResponse.json({ state: toAuthenticatedState(payload) })
  } catch (error) {
    return authErrorResponse(error)
  }
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add "website/src/app/api/auth/wechat-login/sessions/[sessionId]/exchange/route.ts"
git commit -m "feat(website): add wechat login exchange session API route"
```

---

### Task 6: 提取 EmailLoginPanel.tsx

**Files:**
- Create: `website/src/app/(site)/login/EmailLoginPanel.tsx`
- Modify: `website/src/app/(site)/login/LoginContent.tsx`（暂时保持原样，Task 8 再改造）

- [ ] **Step 1: 创建 EmailLoginPanel.tsx**

```tsx
'use client'

import { FormEvent, useState } from 'react'

import type { ApiErrorPayload, AuthState, EmailLoginChallenge } from '@/features/auth/types'

type ChallengeResponse = {
  challenge: EmailLoginChallenge
}

type VerifyResponse = {
  state: AuthState
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'error' in value &&
    typeof (value as ApiErrorPayload).error?.message === 'string'
  )
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown
    if (isApiErrorPayload(payload)) return payload.error.message
  } catch {
    return '请求失败，请稍后重试'
  }
  return '请求失败，请稍后重试'
}

type EmailLoginPanelProps = {
  onSuccess: (state: AuthState) => void
}

export function EmailLoginPanel({ onSuccess }: EmailLoginPanelProps) {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [challenge, setChallenge] = useState<EmailLoginChallenge | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canSubmitEmail = email.trim().length > 3 && !sending
  const canVerify =
    Boolean(challenge?.login_challenge_id) && verificationCode.trim().length >= 4 && !verifying

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSending(true)

    try {
      const response = await fetch('/api/auth/email-login/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        setError(await parseApiError(response))
        return
      }

      const payload = (await response.json()) as ChallengeResponse
      setChallenge(payload.challenge)
      setMessage(
        `验证码已发送，有效期至 ${new Date(payload.challenge.expires_at).toLocaleTimeString()}`,
      )
    } catch {
      setError('认证服务暂时不可用，请稍后重试')
    } finally {
      setSending(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!challenge) return

    setError(null)
    setMessage(null)
    setVerifying(true)

    try {
      const response = await fetch(
        `/api/auth/email-login/challenges/${encodeURIComponent(challenge.login_challenge_id)}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verification_code: verificationCode.trim() }),
        },
      )

      if (!response.ok) {
        setError(await parseApiError(response))
        return
      }

      const payload = (await response.json()) as VerifyResponse
      if (payload.state.authenticated) {
        onSuccess(payload.state)
        return
      }
      setError('登录状态未生效，请重新获取验证码')
    } catch {
      setError('认证服务暂时不可用，请稍后重试')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleRequestCode} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="name@example.com"
            className="mt-2 h-11 w-full rounded-[6px] border border-hairline bg-canvas px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={!canSubmitEmail}
          className="inline-flex h-11 w-full items-center justify-center rounded-[6px] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sending ? '发送中...' : challenge ? '重新发送验证码' : '发送验证码'}
        </button>
      </form>

      <form onSubmit={handleVerifyCode} className="space-y-4 border-t border-hairline pt-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">验证码</span>
          <input
            type="text"
            inputMode="numeric"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            autoComplete="one-time-code"
            placeholder="输入邮箱验证码"
            className="mt-2 h-11 w-full rounded-[6px] border border-hairline bg-canvas px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={!canVerify}
          className="inline-flex h-11 w-full items-center justify-center rounded-[6px] border border-hairline-strong bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {verifying ? '登录中...' : '登录'}
        </button>
      </form>

      {message && (
        <p className="rounded-[6px] border border-accent-2/20 bg-accent-2/10 px-3 py-2 text-sm text-ink-soft">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-[6px] border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add website/src/app/\(site\)/login/EmailLoginPanel.tsx
git commit -m "feat(website): extract EmailLoginPanel from LoginContent"
```

---

### Task 7: 创建 WechatLoginPanel.tsx

**Files:**
- Create: `website/src/app/(site)/login/WechatLoginPanel.tsx`

状态机：`loading → ready（二维码 + 倒计时 + 轮询）→ exchanging → done | error`。使用 `sessionKey` 计数器触发重启，`AbortController` 清理飞行中的请求。

- [ ] **Step 1: 创建 WechatLoginPanel.tsx**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

import type {
  ApiErrorPayload,
  AuthState,
  WechatLoginSession,
  WechatLoginSessionStatus,
} from '@/features/auth/types'

type SessionResponse = { session: WechatLoginSession }
type StatusResponse = { status: WechatLoginSessionStatus }
type ExchangeResponse = { state: AuthState }

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'error' in value &&
    typeof (value as ApiErrorPayload).error?.message === 'string'
  )
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown
    if (isApiErrorPayload(payload)) return payload.error.message
  } catch {
    return '请求失败，请稍后重试'
  }
  return '请求失败，请稍后重试'
}

type PanelState =
  | { phase: 'loading' }
  | { phase: 'ready'; session: WechatLoginSession; secondsLeft: number }
  | { phase: 'exchanging' }
  | { phase: 'done' }
  | { phase: 'error'; message: string }

type WechatLoginPanelProps = {
  onSuccess: (state: AuthState) => void
}

export function WechatLoginPanel({ onSuccess }: WechatLoginPanelProps) {
  const [sessionKey, setSessionKey] = useState(0)
  const [panelState, setPanelState] = useState<PanelState>({ phase: 'loading' })
  const [isMobile, setIsMobile] = useState(false)

  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  // 每次 sessionKey 变化时启动一个新会话（含首次挂载）
  useEffect(() => {
    const ctrl = new AbortController()
    const { signal } = ctrl
    let pollTimer: ReturnType<typeof setTimeout> | null = null
    let countdownTimer: ReturnType<typeof setInterval> | null = null
    let pollFailures = 0

    const cleanup = () => {
      ctrl.abort()
      if (pollTimer !== null) clearTimeout(pollTimer)
      if (countdownTimer !== null) clearInterval(countdownTimer)
    }

    const doExchange = async (sessionId: string) => {
      if (pollTimer !== null) clearTimeout(pollTimer)
      if (countdownTimer !== null) clearInterval(countdownTimer)
      if (signal.aborted) return
      setPanelState({ phase: 'exchanging' })
      try {
        const resp = await fetch(
          `/api/auth/wechat-login/sessions/${encodeURIComponent(sessionId)}/exchange`,
          { method: 'POST', signal },
        )
        if (signal.aborted) return
        if (!resp.ok) {
          setPanelState({ phase: 'error', message: await parseApiError(resp) })
          return
        }
        const { state: authState } = (await resp.json()) as ExchangeResponse
        setPanelState({ phase: 'done' })
        onSuccessRef.current(authState)
      } catch {
        if (signal.aborted) return
        setPanelState({ phase: 'error', message: '登录失败，请重试' })
      }
    }

    void (async () => {
      setPanelState({ phase: 'loading' })
      pollFailures = 0
      try {
        const resp = await fetch('/api/auth/wechat-login/sessions', {
          method: 'POST',
          signal,
        })
        if (signal.aborted) return
        if (!resp.ok) {
          setPanelState({ phase: 'error', message: await parseApiError(resp) })
          return
        }
        const { session } = (await resp.json()) as SessionResponse
        const secondsLeft = Math.max(
          10,
          Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000),
        )
        setPanelState({ phase: 'ready', session, secondsLeft })

        // 倒计时：每秒递减，归零时触发新会话
        countdownTimer = setInterval(() => {
          setPanelState((prev) => {
            if (prev.phase !== 'ready') return prev
            const next = prev.secondsLeft - 1
            if (next <= 0) {
              setSessionKey((k) => k + 1)
              return { phase: 'loading' }
            }
            return { ...prev, secondsLeft: next }
          })
        }, 1000)

        // 轮询：按后端返回的间隔检查会话状态
        const poll = async () => {
          if (signal.aborted) return
          try {
            const pollResp = await fetch(
              `/api/auth/wechat-login/sessions/${encodeURIComponent(session.login_session_id)}`,
              { signal },
            )
            if (signal.aborted) return
            if (!pollResp.ok) {
              pollFailures++
              if (pollFailures >= 3) {
                setPanelState({ phase: 'error', message: '网络连接不稳定，请刷新二维码' })
                return
              }
            } else {
              pollFailures = 0
              const { status } = (await pollResp.json()) as StatusResponse
              if (status.status === 'authenticated' || status.status === 'consumed') {
                await doExchange(session.login_session_id)
                return
              }
              if (status.status === 'expired') {
                setSessionKey((k) => k + 1)
                return
              }
            }
          } catch {
            if (signal.aborted) return
            pollFailures++
            if (pollFailures >= 3) {
              setPanelState({ phase: 'error', message: '网络连接不稳定，请刷新二维码' })
              return
            }
          }
          if (!signal.aborted) {
            pollTimer = setTimeout(poll, session.poll_interval_ms)
          }
        }
        pollTimer = setTimeout(poll, session.poll_interval_ms)
      } catch {
        if (signal.aborted) return
        setPanelState({ phase: 'error', message: '服务暂时不可用，请重试' })
      }
    })()

    return cleanup
  }, [sessionKey])

  const bizmid = process.env.NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID

  return (
    <div>
      {panelState.phase === 'loading' && (
        <div className="flex h-44 items-center justify-center">
          <p className="text-sm text-muted">正在生成二维码...</p>
        </div>
      )}

      {panelState.phase === 'ready' && (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-sm text-ink-soft">扫码关注公众号即可登录</p>
          {isMobile && bizmid ? (
            <a
              href={`https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${encodeURIComponent(bizmid)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-[6px] bg-[#07C160] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              在微信中打开
            </a>
          ) : (
            <img
              src={panelState.session.qr_code_url}
              alt="微信登录二维码"
              width={144}
              height={144}
              className="rounded-[6px]"
            />
          )}
          <p className="text-xs text-muted">二维码将在 {panelState.secondsLeft} 秒后刷新</p>
        </div>
      )}

      {panelState.phase === 'exchanging' && (
        <div className="flex h-44 items-center justify-center">
          <p className="text-sm text-muted">正在登录...</p>
        </div>
      )}

      {panelState.phase === 'error' && (
        <div className="flex h-44 flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-100">{panelState.message}</p>
          <button
            type="button"
            onClick={() => setSessionKey((k) => k + 1)}
            className="inline-flex h-9 items-center rounded-[6px] border border-hairline px-4 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            重新获取二维码
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add website/src/app/\(site\)/login/WechatLoginPanel.tsx
git commit -m "feat(website): add WechatLoginPanel with QR polling and auto-refresh"
```

---

### Task 8: 改造 LoginContent.tsx

**Files:**
- Modify: `website/src/app/(site)/login/LoginContent.tsx`

- [ ] **Step 1: 用以下内容完整替换 LoginContent.tsx**

```tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import type { AuthState } from '@/features/auth/types'
import { EmailLoginPanel } from './EmailLoginPanel'
import { WechatLoginPanel } from './WechatLoginPanel'

function normalizeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  if (value.startsWith('/login')) return '/'
  return value
}

export function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [emailOpen, setEmailOpen] = useState(false)
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
            Weelume Account
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            登录微域生光账号
          </h1>
        </div>

        <div className="rounded-[8px] border border-hairline bg-surface/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
          <WechatLoginPanel onSuccess={handleLoginSuccess} />

          <div className="mt-5 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => setEmailOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              <span>{emailOpen ? '▾' : '▸'}</span>
              使用邮箱登录
            </button>
            {emailOpen && (
              <div className="mt-4">
                <EmailLoginPanel onSuccess={handleLoginSuccess} />
              </div>
            )}
          </div>

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
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错

- [ ] **Step 3: Commit**

```bash
git add website/src/app/\(site\)/login/LoginContent.tsx
git commit -m "feat(website): refactor LoginContent to use WechatLoginPanel as primary login"
```

---

### Task 9: 验收测试

- [ ] **Step 1: 启动后端服务**

```bash
cd server
uv run python -m uvicorn src.main:app --reload --port 8000
```

- [ ] **Step 2: 启动官网开发服务器**

```bash
cd website
pnpm dev
```

- [ ] **Step 3: 桌面端验收**

打开 `http://localhost:3000/login`，确认：
1. 页面默认显示「正在生成二维码...」，随后出现微信二维码图片
2. 倒计时文字「二维码将在 XX 秒后刷新」可见且每秒递减
3. 倒计时归零后自动刷新二维码（页面短暂显示「正在生成二维码...」再显示新码）
4. 「使用邮箱登录」按钮点击后展开邮箱表单
5. 邮箱验证码流程可正常完成登录（需后端配置邮件服务）

- [ ] **Step 4: 移动端验收（可选，需手机访问开发地址）**

使用手机访问开发地址，确认：
- 已配置 `NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID`：显示绿色「在微信中打开」按钮
- 未配置：显示二维码图片

- [ ] **Step 5: 最终类型检查**

```bash
cd website && pnpm tsc --noEmit
```

Expected: 无报错
