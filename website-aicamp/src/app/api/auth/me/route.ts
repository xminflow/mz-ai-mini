import { NextResponse } from 'next/server'
import { getCampAuthState } from '@/features/auth/server/session'
import { authErrorResponse } from '../_shared'

export async function GET() {
  try {
    const state = await getCampAuthState()
    return NextResponse.json({ state })
  } catch (error) {
    return authErrorResponse(error)
  }
}
