import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getWebsiteAuthState } from '@/features/auth/server/session'
import { SubmissionsList } from '@/components/account/SubmissionsList'

export const metadata: Metadata = {
  title: '我的提交记录',
  description: '查看你提交的博主拆解、赛道分析的处理状态。',
  robots: { index: false, follow: false },
}

export default async function MySubmissionsPage() {
  const authState = await getWebsiteAuthState()
  if (!authState.authenticated) {
    redirect('/login?next=/account/submissions')
  }
  return <SubmissionsList />
}
