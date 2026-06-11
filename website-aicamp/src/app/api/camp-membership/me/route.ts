import { proxyMembershipRequest } from '../_shared'
import type { MyCampMembershipResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyMembershipRequest<MyCampMembershipResponse>('/camp-membership/me')
}
