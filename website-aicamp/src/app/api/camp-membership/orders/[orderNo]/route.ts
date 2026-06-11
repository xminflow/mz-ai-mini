import { proxyMembershipRequest } from '../../_shared'
import type { CampOrderStatusResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await context.params
  return proxyMembershipRequest<CampOrderStatusResponse>(
    `/camp-membership/orders/${encodeURIComponent(orderNo)}`,
  )
}
