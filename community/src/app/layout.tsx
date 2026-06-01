import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = process.env.COMMUNITY_SITE_URL?.trim() || 'http://localhost:8666'
const SITE_TITLE = '知识汇 —— 通用知识问答社区'
const SITE_DESCRIPTION =
  '知识汇 —— 通用知识问答社区。在这里提问、分享见解、沉淀知识，与好奇的人一起把问题聊透。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s · 知识汇' },
  description: SITE_DESCRIPTION,
  applicationName: '知识汇',
  openGraph: {
    siteName: '知识汇',
    locale: 'zh_CN',
    type: 'website',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
