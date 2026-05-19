import { redirect } from 'next/navigation'

import { getWebsiteAuthState } from '@/features/auth/server/session'
import { getAccessTokenOrThrow, resolveMembershipApiBaseUrl } from '@/app/api/membership/_shared'
import type { MyMembershipResponse } from '@/features/membership/types'

/**
 * 章节页服务端调用：确保当前用户已登录且具有有效会员资格。
 * 未登录 → redirect 到登录页（携带 next 参数）；已登录但无会员 → redirect 到 /pricing。
 */
export async function requireMembership(currentPath: string): Promise<void> {
  const authState = await getWebsiteAuthState()
  if (!authState.authenticated) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`)
  }

  let isActiveMember = false
  try {
    const accessToken = await getAccessTokenOrThrow()
    const response = await fetch(`${resolveMembershipApiBaseUrl()}/account-membership/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })
    if (response.ok) {
      const envelope = (await response.json()) as { data?: MyMembershipResponse }
      isActiveMember = envelope.data?.is_active === true
    }
  } catch {
    isActiveMember = false
  }

  if (!isActiveMember) {
    redirect('/pricing')
  }
}
