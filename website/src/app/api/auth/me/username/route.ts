import { proxyAuthRequest, readJsonBody } from '../../_shared'

export async function PATCH(request: Request) {
  const body = await readJsonBody(request)
  return proxyAuthRequest('/agent-auth/me/username', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
