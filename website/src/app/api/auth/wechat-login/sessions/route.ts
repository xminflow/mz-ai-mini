import { NextResponse } from 'next/server'

import { createWechatLoginSession } from '@/features/auth/server/backend'
import { authErrorResponse } from '../../_shared'

export async function POST() {
  try {
    const session = await createWechatLoginSession()
    return NextResponse.json({ session })
  } catch (error) {
    return authErrorResponse(error)
  }
}
