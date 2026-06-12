import { NextResponse } from 'next/server'

import { devFakeLogin } from '@/features/auth/server/backend'
import { toAuthenticatedState, writeAuthCookies } from '@/features/auth/server/cookies'
import type { CampMembershipTier } from '@/features/auth/types'
import { authErrorResponse } from '../_shared'

// dev-only: 仅在 NODE_ENV !== 'production' 时启用；生产返回 404。
// 后端 /camp-auth/dev/fake-login 在 env=production 也返回 404，双层保险。

const ALLOWED_TIERS: CampMembershipTier[] = ['none', 'basic', 'premium']

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not Found' } }, { status: 404 })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const usernameRaw = body['username']
    const username = typeof usernameRaw === 'string' ? usernameRaw : undefined
    const tierRaw = body['tier']
    const tier =
      typeof tierRaw === 'string' && ALLOWED_TIERS.includes(tierRaw as CampMembershipTier)
        ? (tierRaw as CampMembershipTier)
        : undefined
    const payload = await devFakeLogin(username, tier)
    await writeAuthCookies(payload)
    return NextResponse.json({ state: toAuthenticatedState(payload) })
  } catch (error) {
    return authErrorResponse(error)
  }
}
