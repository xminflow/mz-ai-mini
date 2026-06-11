import type { Metadata } from 'next'
import { TopNav } from '@/components/layout/TopNav'
import { getCampAuthState } from '@/features/auth/server/session'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'AI 编程实战训练营 · 微域生光',
  description:
    '两门课覆盖两类人群:零基础 AI 编程(¥1999)带你从零做出能上线的网页与小程序;AI 编程专家(¥3999,含第一阶段全部)带你打通企业级 AI 工程、两套实战系统与求职面试。',
  applicationName: '微域生光',
  icons: {
    icon: [{ url: '/logo/weiyu-logo-inverted-favicon.svg', type: 'image/svg+xml', sizes: 'any' }],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authState = await getCampAuthState()
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="relative min-h-screen bg-canvas font-sans text-ink">
        <div className="relative flex min-h-screen flex-col">
          <TopNav initialAuthState={authState} />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
