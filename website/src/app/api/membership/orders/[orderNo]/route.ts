import { proxyMembershipRequest } from '../../_shared'
import type { OrderStatusResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await context.params
  return proxyMembershipRequest<OrderStatusResponse>(
    `/account-membership/orders/${encodeURIComponent(orderNo)}`,
  )
}
