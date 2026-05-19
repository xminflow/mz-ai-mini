import { NextResponse, type NextRequest } from 'next/server'

import { REFRESH_EXPIRES_COOKIE, REFRESH_TOKEN_COOKIE } from '@/features/auth/cookie-names'
import { isProtectedPath } from '@/features/auth/protected-routes'

function isRefreshCookieValid(request: NextRequest): boolean {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const refreshExpiresAt = request.cookies.get(REFRESH_EXPIRES_COOKIE)?.value
  if (!refreshToken || !refreshExpiresAt) return false

  const expiresAt = new Date(refreshExpiresAt).getTime()
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (!isProtectedPath(pathname) || isRefreshCookieValid(request)) {
    return NextResponse.next()
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.search = ''
  loginUrl.searchParams.set('next', `${pathname}${search}`)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo|api/auth).*)'],
}
