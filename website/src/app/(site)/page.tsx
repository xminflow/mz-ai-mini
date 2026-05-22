import type { Metadata } from 'next'
import { HomeContent } from '@/components/pages/HomeContent'
import { fetchLibraryHubData } from '@/services/library'

export const metadata: Metadata = {
  title: 'AI × 自媒体，让客户源源不断地找上门 · 微域生光',
  description:
    '自媒体营销获客不要再做无效尝试。真实赛道分析 + 一线博主拆解 + 可落地的百万级大V运营实战精炼方法论 + 能上手的 AI 信息工具，把别人验证过的经验变成你的方法，助你消除信息差、实现流量与客源的极速增长。',
  openGraph: {
    title: 'AI × 自媒体，让客户源源不断地找上门 · 微域生光',
    description:
      '自媒体获客不再做无效尝试——赛道分析、博主拆解、运营方法论与 AI 信息工具，把别人验证过的经验变成你的方法。',
  },
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const hub = await fetchLibraryHubData()
  return <HomeContent counts={hub.counts} />
}
