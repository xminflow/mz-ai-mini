import { NextResponse, type NextRequest } from 'next/server'

import {
  ACCESS_EXPIRES_COOKIE,
  ACCESS_TOKEN_COOKIE,
  REFRESH_EXPIRES_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@/features/auth/cookie-names'
import { isProtectedPath } from '@/features/auth/protected-routes'
import { refreshSession, WebsiteAuthError } from '@/features/auth/server/backend'
import type { AuthPayload } from '@/features/auth/types'

function isExpired(value: string | null | undefined): boolean {
  if (!value) return true
  const t = new Date(value).getTime()
  return Number.isNaN(t) || t <= Date.now()
}

function isSessionRevocation(error: unknown): boolean {
  if (!(error instanceof WebsiteAuthError)) return false
  return (
    error.code === 'AGENT_AUTH.REFRESH_TOKEN_EXPIRED' ||
    error.code === 'AGENT_AUTH.SESSION_REVOKED'
  )
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function applyAuthCookies(
  response: NextResponse,
  request: NextRequest,
  payload: AuthPayload,
): void {
  const { tokens } = payload
  const accessExpires = new Date(tokens.access_token_expires_at)
  const refreshExpires = new Date(tokens.refresh_token_expires_at)

  const accessExpireOption = Number.isNaN(accessExpires.getTime()) ? undefined : accessExpires
  const refreshExpireOption = Number.isNaN(refreshExpires.getTime()) ? undefined : refreshExpires

  const baseOptions = {
    sameSite: 'lax' as const,
    secure: isProduction(),
    path: '/',
  }

  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...baseOptions,
    httpOnly: true,
    expires: accessExpireOption,
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...baseOptions,
    httpOnly: true,
    expires: refreshExpireOption,
  })
  response.cookies.set(ACCESS_EXPIRES_COOKIE, tokens.access_token_expires_at, {
    ...baseOptions,
    httpOnly: false,
    expires: accessExpireOption,
  })
  response.cookies.set(REFRESH_EXPIRES_COOKIE, tokens.refresh_token_expires_at, {
    ...baseOptions,
    httpOnly: false,
    expires: refreshExpireOption,
  })

  // 同步写回 request.cookies，让下游 layout / route handler 读到新值，避免本次请求继续用过期 access
  request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token)
  request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token)
  request.cookies.set(ACCESS_EXPIRES_COOKIE, tokens.access_token_expires_at)
  request.cookies.set(REFRESH_EXPIRES_COOKIE, tokens.refresh_token_expires_at)
}

function clearAuthCookies(response: NextResponse, request: NextRequest): void {
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
  response.cookies.delete(ACCESS_EXPIRES_COOKIE)
  response.cookies.delete(REFRESH_EXPIRES_COOKIE)
  request.cookies.delete(ACCESS_TOKEN_COOKIE)
  request.cookies.delete(REFRESH_TOKEN_COOKIE)
  request.cookies.delete(ACCESS_EXPIRES_COOKIE)
  request.cookies.delete(REFRESH_EXPIRES_COOKIE)
}

// 只在顶级文档导航上做静默刷新：避免页面并行触发的 API 请求各自抢着 refresh，
// 因为后端 refresh token 是一次性的，并发刷新会互相作废。子请求会复用刚刷新的 cookie。
function isDocumentNavigation(request: NextRequest): boolean {
  return request.headers.get('sec-fetch-dest') === 'document'
}

async function maybeRefreshTokens(request: NextRequest): Promise<NextResponse | null> {
  if (!isDocumentNavigation(request)) return null

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const refreshExpiresAt = request.cookies.get(REFRESH_EXPIRES_COOKIE)?.value ?? null
  const accessExpiresAt = request.cookies.get(ACCESS_EXPIRES_COOKIE)?.value ?? null

  if (!refreshToken) return null
  if (isExpired(refreshExpiresAt)) return null
  if (!isExpired(accessExpiresAt)) return null

  try {
    const payload = await refreshSession(refreshToken)
    const response = NextResponse.next({ request })
    applyAuthCookies(response, request, payload)
    if (!isProduction()) {
      console.debug(
        '[auth][middleware] refreshed tokens for',
        request.nextUrl.pathname,
        'new access_expires_at=',
        payload.tokens.access_token_expires_at,
      )
    }
    return response
  } catch (error) {
    if (isSessionRevocation(error)) {
      const response = NextResponse.next({ request })
      clearAuthCookies(response, request)
      console.warn(
        '[auth][middleware] session revoked while refreshing at',
        request.nextUrl.pathname,
        '— cookies cleared',
      )
      return response
    }
    // 后端短暂不可用（网络/5xx）：保留 cookie，让本次请求按未刷新状态继续，由下游自行处理
    console.warn(
      '[auth][middleware] transient refresh failure at',
      request.nextUrl.pathname,
      ':',
      error instanceof Error ? error.message : String(error),
    )
    return null
  }
}

function isRefreshCookieValid(request: NextRequest): boolean {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const refreshExpiresAt = request.cookies.get(REFRESH_EXPIRES_COOKIE)?.value
  if (!refreshToken || !refreshExpiresAt) return false

  const expiresAt = new Date(refreshExpiresAt).getTime()
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const refreshed = await maybeRefreshTokens(request)

  if (!isProtectedPath(pathname)) {
    return refreshed ?? NextResponse.next()
  }

  if (isRefreshCookieValid(request)) {
    return refreshed ?? NextResponse.next()
  }

  // Next.js 15 的 middleware adapter 会用 new URL(Location) 解析响应头，相对路径会抛 Invalid URL → 500。
  // 改走 request.nextUrl.clone()：host 由 Next.js 按 x-forwarded-host 解析，反代正确配置时不会出 0.0.0.0。
  const target = request.nextUrl.clone()
  target.pathname = '/login'
  target.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`
  return NextResponse.redirect(target, 307)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo|api/auth).*)'],
}
