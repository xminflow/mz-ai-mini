import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginContent } from './LoginContent'

export const metadata: Metadata = {
  title: '登录 · 微域生光',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
