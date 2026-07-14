import type { Metadata } from 'next'
import { StudioContent } from '@/components/pages/StudioContent'

export const metadata: Metadata = {
  title: 'AI企业项目实战',
  description:
    '20 个真实企业级项目由浅入深，挑选你需要的直接写入简历；报名即赠往期课程全套录播视频 + 针对性答疑。',
  openGraph: {
    title: 'AI企业项目实战 · 微域生光',
    description: '20 个真实企业级项目由浅入深，挑选你需要的直接写入简历。',
  },
}

export default function HomePage() {
  return <StudioContent />
}
