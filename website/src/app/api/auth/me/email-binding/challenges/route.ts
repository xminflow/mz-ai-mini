import { proxyAuthRequest, readJsonBody } from '../../../_shared'

export async function POST(request: Request) {
  const body = await readJsonBody(request)
  return proxyAuthRequest('/agent-auth/me/email-binding/challenges', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
