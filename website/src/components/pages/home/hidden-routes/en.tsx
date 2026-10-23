import type { Metadata } from 'next'

import { HomeContent } from '@/components/pages/home/HomeContent'

const title = 'Custom software, personal service · Weelume'
const description = 'Websites, business systems, mobile apps, AI agents and SaaS platforms. A dedicated team from discovery and design to launch and long-term maintenance.'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  applicationName: 'Weelume',
  keywords: ['custom software development', 'business websites', 'AI agents', 'SaaS development', 'Weelume'],
  authors: [{ name: 'Weelume' }],
  creator: 'Weelume',
  publisher: 'Weelume',
  alternates: { canonical: '/en', languages: { 'zh-CN': '/', en: '/en', 'x-default': '/' } },
  // Next.js 按整体替换社交元信息，英文页显式保留封面与站点属性。
  openGraph: {
    title,
    description,
    siteName: 'Weelume',
    locale: 'en_US',
    alternateLocale: 'zh_CN',
    type: 'website',
    url: '/en',
    images: [{ url: '/og/cover.png', width: 1200, height: 630, alt: 'Weelume custom software development', type: 'image/png' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og/cover.png'] },
}

export default function EnglishHomePage() {
  return <HomeContent locale="en" />
}
