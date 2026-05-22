import { NextResponse } from 'next/server'

import { WebsiteAuthError, devFakeLogin } from '@/features/auth/server/backend'
import { toAuthenticatedState, writeAuthCookies } from '@/features/auth/server/cookies'
import { authErrorResponse, readJsonBody } from '../_shared'

// dev-only: 仅在 NODE_ENV !== 'production' 时启用。生产环境构建即返回 404。
// 后端 /agent-auth/dev/fake-login 会在 env=production 时也返回 404，双层保险。

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not Found' } }, { status: 404 })
  }

  try {
    const body = await readJsonBody(request)
    const usernameRaw = body['username']
    const username = typeof usernameRaw === 'string' ? usernameRaw : undefined
    const payload = await devFakeLogin(username)
    await writeAuthCookies(payload)
    return NextResponse.json({ state: toAuthenticatedState(payload) })
  } catch (error) {
    if (error instanceof WebsiteAuthError) {
      return authErrorResponse(error)
    }
    return authErrorResponse(error)
  }
}
