// 原软件定制首页入口完整保留在 components/pages/home/hidden-routes/zh.tsx。
import type { Metadata } from 'next'
import { TemplateMarketHome } from '@/features/site-templates/workbench/TemplateMarketHome'

export const metadata: Metadata = {
  title: { absolute: '探索模板 · 微域生光' },
  description: '探索完整的网站模板与真实交互，从喜欢的设计开始你的项目。',
  alternates: { canonical: '/' },
  openGraph: {
    title: '探索模板 · 微域生光',
    description: '探索完整的网站模板与真实交互，从喜欢的设计开始你的项目。',
    siteName: '微域生光', locale: 'zh_CN', type: 'website', url: '/',
    images: [{ url: '/og/cover.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: '探索模板 · 微域生光', images: ['/og/cover.png'] },
}

export default function HomePage() {
  return <TemplateMarketHome />
}
