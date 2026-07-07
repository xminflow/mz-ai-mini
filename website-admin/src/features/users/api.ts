import { request } from '@/lib/apiClient'
import type { AccountStatus, CampAccountAdmin, CampAccountPage, MembershipTier } from './types'

type ListParams = {
  keyword?: string
  status?: AccountStatus | ''
  page: number
  pageSize: number
  token: string
}

export const usersApi = {
  list(p: ListParams): Promise<CampAccountPage> {
    const q = new URLSearchParams()
    if (p.keyword) q.set('keyword', p.keyword)
    if (p.status) q.set('status', p.status)
    q.set('page', String(p.page))
    q.set('page_size', String(p.pageSize))
    return request<CampAccountPage>(`/admin/camp-accounts?${q.toString()}`, { token: p.token })
  },
  updateStatus(accountId: string, status: AccountStatus, token: string): Promise<CampAccountAdmin> {
    return request<CampAccountAdmin>(`/admin/camp-accounts/${accountId}/status`, {
      method: 'PATCH',
      body: { status },
      token,
    })
  },
  updateMembership(
    accountId: string,
    tier: MembershipTier,
    expiresAt: string | null,
    token: string,
  ): Promise<CampAccountAdmin> {
    return request<CampAccountAdmin>(`/admin/camp-accounts/${accountId}/membership`, {
      method: 'PATCH',
      body: { tier, expires_at: expiresAt },
      token,
    })
  },
  remove(accountId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/admin/camp-accounts/${accountId}`, {
      method: 'DELETE',
      token,
    })
  },
}
