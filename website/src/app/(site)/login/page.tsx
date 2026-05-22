import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginContent } from './LoginContent'

export const metadata: Metadata = {
  title: '登录',
  description: '登录微域生光官网账号，与 ua-agent 共享账号体系。',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
