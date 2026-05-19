import type { ReactNode } from 'react'

import { getWebsiteAuthState } from '@/features/auth/server/session'
import { PlaybookTopNav } from '@/components/playbook/PlaybookTopNav'

export default async function PlaybookLayout({ children }: { children: ReactNode }) {
  const authState = await getWebsiteAuthState()
  return (
    <>
      <PlaybookTopNav initialAuthState={authState} />
      {children}
    </>
  )
}
