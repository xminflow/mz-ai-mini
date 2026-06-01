import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/auth/session'

export function middleware(request: NextRequest) {
  const session = decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (session) {
    return NextResponse.next()
  }
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

// 只拦截登录后区路由；公开页与公开内容页不经过此 middleware
export const config = {
  matcher: ['/feed/:path*', '/new/:path*', '/me/:path*'],
}
