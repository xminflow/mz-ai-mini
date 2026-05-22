import { proxyMembershipRequest } from '../../membership/_shared'
import type { MyMemberSubmissionsResponse } from '@/features/member-submissions/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const search = url.search
  const target = `/member-submissions/me${search}`
  return proxyMembershipRequest<MyMemberSubmissionsResponse>(target)
}
