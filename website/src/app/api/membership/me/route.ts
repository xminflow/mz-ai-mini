import { proxyMembershipRequest } from '../_shared'
import type { MyMembershipResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyMembershipRequest<MyMembershipResponse>('/account-membership/me')
}
