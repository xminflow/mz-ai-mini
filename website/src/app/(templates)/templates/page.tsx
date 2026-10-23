import type { Metadata } from 'next'
import { TemplateMarketHome } from '@/features/site-templates/workbench/TemplateMarketHome'

export const metadata: Metadata = {
  title: { absolute: '探索模板 · 微域生光' },
  description: '探索完整的网站模板与真实交互，从喜欢的设计开始你的项目。',
  alternates: { canonical: '/' },
}

export default function TemplatesWorkbenchPage() {
  return <TemplateMarketHome />
}
