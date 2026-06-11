import { NextResponse } from 'next/server'

import type { ApiErrorPayload } from '@/features/auth/types'
import { WebsiteAuthError } from '@/features/auth/server/backend'

export function authErrorResponse(error: unknown): NextResponse<ApiErrorPayload> {
  if (error instanceof WebsiteAuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }
  return NextResponse.json(
    { error: { code: 'AUTH.INTERNAL_ERROR', message: '认证请求处理失败' } },
    { status: 500 },
  )
}
