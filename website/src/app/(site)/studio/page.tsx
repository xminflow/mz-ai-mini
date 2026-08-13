import type { Metadata } from 'next'
import { StudioContent } from '@/components/pages/StudioContent'

export const metadata: Metadata = {
  title: '企业培训',
  description:
    '10 个真实企业级项目由浅入深，挑选你需要的直接写入简历；报名即赠往期课程全套录播视频 + 针对性答疑。',
  openGraph: {
    title: '企业培训 · 微域生光',
    description: '10 个真实企业级项目由浅入深，挑选你需要的直接写入简历。',
  },
}

export default function StudioPage() {
  return <StudioContent />
}
