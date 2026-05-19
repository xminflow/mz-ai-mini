import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LibraryList } from '@/components/library'
import { fetchLibraryList } from '@/services/library'

export const metadata: Metadata = {
  title: '信息库 · 把别人验证过的东西，拆给你看',
  description:
    '爆款拆解、博主洞察、赛道分析、百万粉博主运营方法论精炼——一个面向「想做自媒体获客」群体的可读、可搜、可导航的信息库。',
  openGraph: {
    title: '信息库 | 微域生光',
    description: '拆解 · 博主 · 赛道 · 手册——可读、可搜、可导航。',
  },
}

export default function LibraryPage() {
  const data = fetchLibraryList({ limit: 999 })
  return (
    <Suspense fallback={null}>
      <LibraryList
        initialItems={data.list}
        platforms={data.availablePlatforms}
        industries={data.availableIndustries}
      />
    </Suspense>
  )
}
