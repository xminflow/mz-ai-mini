import type { Metadata } from 'next'
import { HomeContent } from '@/components/pages/HomeContent'
import { fetchLibraryList } from '@/services/library'

export const metadata: Metadata = {
  title: '微域生光 — AI 时代，真实的案例才更有价值',
  description:
    '自媒体是当下最大的获客通路，信任建立在内容上。AI 让二手解读过剩，真实跑出来的案例反而稀缺——我们拆解爆款、追踪博主、读懂赛道，让内容 + AI 工具放大你的产能。',
  openGraph: {
    title: '微域生光 — AI 时代，真实的案例才更有价值',
    description: '内容是内核，AI 是生产工具——只有两者结合，才能产生真正的价值。',
  },
}

export default function HomePage() {
  const initial = fetchLibraryList({ limit: 0 })
  return <HomeContent counts={initial.counts} />
}
