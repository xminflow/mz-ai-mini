import { proxyMembershipRequest } from '../_shared'
import type { CreateOrderResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

export async function POST() {
  return proxyMembershipRequest<CreateOrderResponse>('/account-membership/orders', {
    method: 'POST',
    body: JSON.stringify({ sku: 'annual_normal' }),
  })
}
