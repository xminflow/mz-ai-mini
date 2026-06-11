import { NextResponse } from 'next/server'
import { exchangeWechatLogin } from '@/features/auth/server/backend'
import { toAuthenticatedState, writeAuthCookies } from '@/features/auth/server/cookies'
import { authErrorResponse } from '../../../../_shared'

type RouteContext = { params: Promise<{ sessionId: string }> }

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
