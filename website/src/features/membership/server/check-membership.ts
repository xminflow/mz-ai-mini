import 'server-only'

import { resolveMembershipApiBaseUrl } from '@/app/api/membership/_shared'
import type { MyMembershipResponse } from '@/features/membership/types'

/**
 * 检查指定 access token 对应的账号是否持有有效会员资格。
 * 调用方应已完成登录校验；网络错误或后端异常均视为无会员（保守策略）。
 */
export async function checkActiveMembership(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${resolveMembershipApiBaseUrl()}/account-membership/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })
    if (!response.ok) return false
    const envelope = (await response.json()) as { data?: MyMembershipResponse }
    return envelope.data?.is_active === true
  } catch {
    return false
  }
}
