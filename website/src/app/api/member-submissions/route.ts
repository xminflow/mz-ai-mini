import { proxyMembershipRequest } from '../membership/_shared'
import type { CreateMemberSubmissionResponse } from '@/features/member-submissions/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  return proxyMembershipRequest<CreateMemberSubmissionResponse>('/member-submissions', {
    method: 'POST',
    body,
  })
}
