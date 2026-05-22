import { proxyMembershipRequest } from '../../../membership/_shared'
import type { MyQuotaResponse } from '@/features/member-submissions/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyMembershipRequest<MyQuotaResponse>('/member-submissions/me/quota')
}
