import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/auth/session'
import { getMockFeed } from '@/lib/mock/feed'

// 登录后取数的 BFF 代理。先校验会话 cookie，再返回数据。
// 本期返回 mock；真实化后改为携带会话向 community-server 取数（见 lib/api/server.ts）。
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const cookieStore = await cookies()
  const session = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { path } = await params
  const resource = path.join('/')
  if (resource === 'feed') {
    return NextResponse.json({ items: getMockFeed(), viewer: session })
  }
  return NextResponse.json({ error: 'not found' }, { status: 404 })
}
