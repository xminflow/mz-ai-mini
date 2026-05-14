import type { Metadata } from 'next'
import { HomeContent } from '@/components/pages/HomeContent'

export const metadata: Metadata = {
  title: '微域生光 — AI 时代的赚钱逻辑，正在被重写',
  description:
    '赚钱难度上升？不是你的生意不好，是 AI 时代的赚钱逻辑，正在被重写。我们用行业研究、AI 与品牌方法论，帮经营者与创业者，把专业与资源重构为 AI 时代的 IP 与品牌资产。',
  openGraph: {
    title: '微域生光 — AI 时代的赚钱逻辑，正在被重写',
    description:
      '赚钱难度上升？不是你的生意不好，是 AI 时代的赚钱逻辑，正在被重写。',
  },
}

export default function HomePage() {
  return <HomeContent />
}
