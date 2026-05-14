import type { Metadata } from 'next'
import { AboutContent } from '@/components/pages/AboutContent'

export const metadata: Metadata = {
  title: '关于微域生光 · 我们服务谁',
  description:
    '以研究为基础，为经营者与创业者重构 AI 时代的 IP 与品牌资产。',
  openGraph: {
    title: '关于微域生光',
    description:
      '以研究为基础，为经营者与创业者重构 AI 时代的 IP 与品牌资产。',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
