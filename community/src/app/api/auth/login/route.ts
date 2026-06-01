import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, encodeSession } from '@/lib/auth/session'

// 本期 mock：接受任意非空账号并签发会话 cookie。
// TODO(接真鉴权)：转调 community-server 校验凭据，换取后端 token 后写入 cookie。
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { account?: string } | null
  const account = body?.account?.trim()
  if (!account) {
    return NextResponse.json({ error: 'account is required' }, { status: 400 })
  }
  const response = NextResponse.json({ ok: true, user: { userId: account, name: account } })
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: encodeSession({ userId: account, name: account }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
