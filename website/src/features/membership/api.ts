import type { CreateOrderResponse, MyMembershipResponse, OrderStatusResponse } from './types'

class MembershipApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, options: { status: number; code: string }) {
    super(message)
    this.name = 'MembershipApiError'
    this.status = options.status
    this.code = options.code
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })
  const payload = (await response.json()) as unknown
  if (!response.ok) {
    const error =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as { error?: { code?: string; message?: string } }).error
        : undefined
    throw new MembershipApiError(error?.message ?? '会员服务请求失败', {
      status: response.status,
      code: error?.code ?? 'membership_request_failed',
    })
  }
  return payload as T
}

export async function createMembershipOrder(): Promise<CreateOrderResponse> {
  return requestJson<CreateOrderResponse>('/api/membership/orders', {
    method: 'POST',
    body: JSON.stringify({ sku: 'annual_normal' }),
  })
}

export async function getMembershipOrder(orderNo: string): Promise<OrderStatusResponse> {
  return requestJson<OrderStatusResponse>(`/api/membership/orders/${encodeURIComponent(orderNo)}`)
}

export async function getMyMembership(): Promise<MyMembershipResponse> {
  return requestJson<MyMembershipResponse>('/api/membership/me')
}

export { MembershipApiError }
