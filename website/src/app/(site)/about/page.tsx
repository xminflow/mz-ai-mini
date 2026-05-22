import type { Metadata } from 'next'
import { AboutContent } from '@/components/pages/AboutContent'

export const metadata: Metadata = {
  title: '关于微域生光 · 为什么我们做 AI × 自媒体获客',
  description:
    '微域生光专注 AI × 自媒体获客——把别人验证过的赛道、一线博主、爆款方法论一条条拆给已经决定把自媒体当作主获客通路的人，再用能上手的 AI 信息工具放大成可用的产能。',
  openGraph: {
    title: '关于微域生光',
    description: 'AI × 自媒体获客 · 把别人验证过的经验变成你的方法，消除信息差。',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
