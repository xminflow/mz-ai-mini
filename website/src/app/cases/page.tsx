import type { Metadata } from 'next'
import { CaseBrowserLayout } from '@/components/case-browser'
import { fetchStoryList } from '@/services'
import type { StoryListResult } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '行业报告 · 启动 IP 之前的结构性诊断',
  description:
    '拆解各行业里 IP 的构建逻辑、品牌的积累路径、影响力的形成机制——为经营者与创业者在重要决策前提供可参考的行业底稿。年费订阅制，合作客户免费。',
  openGraph: {
    title: '行业报告 | 微域生光',
    description: '拆解各行业里 IP 的构建逻辑、品牌的积累路径、影响力的形成机制。',
  },
}

export default async function CasesPage() {
  let initialData: StoryListResult | undefined
  try {
    initialData = await fetchStoryList({ pageSize: 50 })
  } catch (err) {
    // SSR fetch failed; fall back to client-side fetch which surfaces a retry UI.
    console.error('[cases] SSR fetchStoryList failed:', err)
    initialData = undefined
  }
  return <CaseBrowserLayout initialData={initialData} />
}
