import { NextResponse } from 'next/server'
import { proxyAuthRequest, readJsonBody } from '../../_shared'

export async function POST(request: Request) {
  const body = await readJsonBody(request)
  if (typeof body.content_base64 !== 'string' || body.content_base64.length > 2796204) {
    return NextResponse.json({ error: { code: 'AUTH.INVALID_AVATAR', message: '头像大小不能超过 2 MB。' } }, { status: 413 })
  }
  return proxyAuthRequest('/agent-auth/me/avatar', { method: 'POST', body: JSON.stringify(body) })
}
