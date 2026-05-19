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
