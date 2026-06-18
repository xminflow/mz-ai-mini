import { NextResponse, type NextRequest } from 'next/server'

import { refreshSession, WebsiteAuthError } from '@/features/auth/server/backend'
import {
  clearAuthCookies,
  isExpired,
  readAuthCookies,
  writeAuthCookies,
} from '@/features/auth/server/cookies'

// 可写上下文（Route Handler）里的续签端点：渲染期（Server Component）无法落盘轮换后的一次性
// refresh token，故所有「access 过期需轮换」的场景统一收敛到这里执行，保证刷新结果一定落盘。
//   POST：客户端自动续签调用，返回新过期时间用于重排定时器。
//   GET ?next=：SSR 渲染发现 needs_refresh 时重定向到此，续签落盘后 307 跳回 next（自愈）。

function isSessionRevocation(error: unknown): boolean {
  if (!(error instanceof WebsiteAuthError)) return false
  return (
    error.code === 'CAMP_AUTH.REFRESH_TOKEN_EXPIRED' ||
    error.code === 'CAMP_AUTH.SESSION_REVOKED'
  )
}

type RefreshOutcome =
  | { status: 'ok'; accessExpiresAt: string; refreshExpiresAt: string }
  | { status: 'revoked' }
  | { status: 'transient' }

// 读 refresh cookie → 轮换 → 落盘。撤销/过期返回 revoked（已清 cookie）；后端短暂故障返回 transient（保留 cookie）。
async function performRefresh(): Promise<RefreshOutcome> {
  const snapshot = await readAuthCookies()
  if (!snapshot.refreshToken || isExpired(snapshot.refreshTokenExpiresAt)) {
    return { status: 'revoked' }
  }
  try {
    const payload = await refreshSession(snapshot.refreshToken)
    await writeAuthCookies(payload)
    return {
      status: 'ok',
      accessExpiresAt: payload.tokens.access_token_expires_at,
      refreshExpiresAt: payload.tokens.refresh_token_expires_at,
    }
  } catch (error) {
    if (isSessionRevocation(error)) {
      await clearAuthCookies()
      return { status: 'revoked' }
    }
    // 后端短暂不可用：保留 cookie，调用方稍后重试
    return { status: 'transient' }
  }
}

// 仅允许站内相对路径，杜绝开放重定向（//host、http(s):// 一律回落 /course）。
function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/course'
  return raw
}

export async function POST() {
  const outcome = await performRefresh()
  if (outcome.status === 'ok') {
    return NextResponse.json({
      access_token_expires_at: outcome.accessExpiresAt,
      refresh_token_expires_at: outcome.refreshExpiresAt,
    })
  }
  if (outcome.status === 'revoked') {
    return NextResponse.json(
      { error: { code: 'CAMP_AUTH.SESSION_REVOKED', message: '会话已失效，请重新登录' } },
      { status: 401 },
    )
  }
  return NextResponse.json(
    { error: { code: 'AUTH.REFRESH_TRANSIENT', message: '续签暂时失败，请稍后重试' } },
    { status: 503 },
  )
}

export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get('next'))
  const outcome = await performRefresh()

  const target = request.nextUrl.clone()
  if (outcome.status === 'ok') {
    // 续签成功：跳回原页面，此时 access 已是新鲜的，渲染不会再触发 needs_refresh
    const dest = new URL(next, request.nextUrl.origin)
    target.pathname = dest.pathname
    target.search = dest.search
    return NextResponse.redirect(target, 307)
  }

  // 失败（撤销或短暂故障）：跳登录页（带 next），避免与原页面形成 needs_refresh ↔ refresh 死循环
  target.pathname = '/login'
  target.search = `?next=${encodeURIComponent(next)}`
  return NextResponse.redirect(target, 307)
}
