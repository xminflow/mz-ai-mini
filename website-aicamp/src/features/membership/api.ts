import type { CampOrderStatusResponse, CampMembershipSku, CreateCampOrderResponse, MyCampMembershipResponse } from './types'

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

export async function createCampMembershipOrder(sku: CampMembershipSku): Promise<CreateCampOrderResponse> {
  return requestJson<CreateCampOrderResponse>('/api/camp-membership/orders', {
    method: 'POST',
    body: JSON.stringify({ sku }),
  })
}

export async function getCampMembershipOrder(orderNo: string): Promise<CampOrderStatusResponse> {
  return requestJson<CampOrderStatusResponse>(`/api/camp-membership/orders/${encodeURIComponent(orderNo)}`)
}

export async function getMyCampMembership(): Promise<MyCampMembershipResponse> {
  return requestJson<MyCampMembershipResponse>('/api/camp-membership/me')
}

export { MembershipApiError }
