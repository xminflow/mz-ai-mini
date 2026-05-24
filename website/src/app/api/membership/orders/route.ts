import { NextRequest } from 'next/server'

import { membershipErrorResponse, proxyMembershipRequest } from '../_shared'
import type { CreateOrderResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

const VALID_SKUS = ['annual_normal', 'annual_premium'] as const
type ValidSku = (typeof VALID_SKUS)[number]

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown
    const sku: unknown = body && typeof body === 'object' && 'sku' in body ? (body as Record<string, unknown>).sku : undefined
    if (!VALID_SKUS.includes(sku as ValidSku)) {
      return Response.json({ error: { code: 'invalid_sku', message: '无效的会员 SKU' } }, { status: 400 })
    }
    return proxyMembershipRequest<CreateOrderResponse>('/account-membership/orders', {
      method: 'POST',
      body: JSON.stringify({ sku }),
    })
  } catch {
    return membershipErrorResponse(new Error('请求体解析失败'))
  }
}
