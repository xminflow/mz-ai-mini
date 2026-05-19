import { proxyAuthRequest, readJsonBody } from '../../../../../_shared'

export async function POST(
  request: Request,
  context: { params: Promise<{ loginChallengeId: string }> },
) {
  const { loginChallengeId } = await context.params
  const body = await readJsonBody(request)
  return proxyAuthRequest(
    `/agent-auth/me/email-binding/challenges/${encodeURIComponent(loginChallengeId)}/verify`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  )
}
