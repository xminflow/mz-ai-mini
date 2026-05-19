import type { Metadata } from 'next'
import { AboutContent } from '@/components/pages/AboutContent'

export const metadata: Metadata = {
  title: '关于微域生光 · 我们服务谁',
  description:
    '我们专注内容获客与真实信息研究——帮已经决定把自媒体当作获客通路的人，把别人验证过的爆款、百万博主、赛道一条条拆开看清楚，再用 AI 工具放大成可用的产能。',
  openGraph: {
    title: '关于微域生光',
    description: '专注内容获客与真实信息研究——把值得学的拆开看清楚，再用 AI 工具放大。',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
