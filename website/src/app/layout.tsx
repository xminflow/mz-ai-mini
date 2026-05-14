import type { Metadata } from 'next'
import { TopNav } from '@/components/layout/TopNav'
import { SiteFooter } from '@/components/layout/SiteFooter'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '微域生光 — 为经营者与创业者重构 AI 时代的 IP 与品牌资产',
    template: '%s | 微域生光',
  },
  description:
    '多数生意的放缓，不来自商业模式，而来自 AI 时代的价值尚未进入你的体系。我们用行业研究、AI 与品牌方法论，帮经营者与创业者，重构 IP 与品牌资产。',
  icons: {
    icon: [
      { url: '/logo/weiyu-logo-inverted-favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/logo/weiyu-logo-inverted.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/logo/weiyu-logo-inverted.png',
    apple: { url: '/logo/weiyu-logo-inverted.png', sizes: '180x180' },
  },
  openGraph: {
    siteName: '微域生光',
    locale: 'zh_CN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="relative flex min-h-screen flex-col bg-canvas font-sans text-ink">
        <TopNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
