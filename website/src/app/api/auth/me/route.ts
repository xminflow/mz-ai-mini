import { NextResponse } from 'next/server'

import { getWebsiteAuthState } from '@/features/auth/server/session'
import { authErrorResponse } from '../_shared'

export async function GET() {
  try {
    const state = await getWebsiteAuthState()
    return NextResponse.json({ state })
  } catch (error) {
    return authErrorResponse(error)
  }
}
