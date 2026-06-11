import { NextResponse } from 'next/server'
import { logoutSession } from '@/features/auth/server/backend'
import { clearAuthCookies, readAuthCookies } from '@/features/auth/server/cookies'
import { authErrorResponse } from '../_shared'

export async function POST() {
  const snapshot = await readAuthCookies()
  try {
    if (snapshot.refreshToken) await logoutSession(snapshot.refreshToken)
    await clearAuthCookies()
    return NextResponse.json({ revoked: true })
  } catch (error) {
    await clearAuthCookies()
    return authErrorResponse(error)
  }
}
