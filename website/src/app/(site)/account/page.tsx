import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AccountProfileSection } from '@/features/account/AccountProfileSection'
import { MyMembershipSection } from '@/features/membership/MyMembershipSection'
import type { MyMembershipResponse } from '@/features/membership/types'
import { getWebsiteAuthState } from '@/features/auth/server/session'
import { getAccessTokenOrThrow, resolveMembershipApiBaseUrl } from '@/app/api/membership/_shared'

export const metadata: Metadata = {
  title: '我的账号',
  description: '管理微域生光官网账号的个人信息与会员状态。',
  robots: { index: false, follow: false },
}

async function loadMembership(): Promise<MyMembershipResponse> {
  const accessToken = await getAccessTokenOrThrow()
  const response = await fetch(`${resolveMembershipApiBaseUrl()}/account-membership/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Failed to load membership')
  const envelope = (await response.json()) as { data?: MyMembershipResponse }
  if (!envelope.data) throw new Error('Invalid membership response')
  return envelope.data
}

export default async function AccountPage() {
  const authState = await getWebsiteAuthState()
  if (!authState.authenticated) {
    redirect('/login?next=/account')
  }

  const membership = await loadMembership()
  return (
    <>
      <AccountProfileSection account={authState.account} />
      <MyMembershipSection membership={membership} />
    </>
  )
}
