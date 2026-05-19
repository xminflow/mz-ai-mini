import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '微域生光 — AI 时代，真实的案例才更有价值',
    template: '%s | 微域生光',
  },
  description:
    'AI 时代，真实的案例才更有价值。内容是内核，AI 是生产工具——我们拆解爆款、追踪博主、读懂赛道。爆款拆解、博主洞察、赛道分析、百万博主运营实战，覆盖自媒体获客的内容与决策。',
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
  verification: {
    other: {
      'baidu-site-verification': 'codeva-qdMVN4OfnO',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="relative min-h-screen bg-canvas font-sans text-ink">{children}</body>
    </html>
  )
}
