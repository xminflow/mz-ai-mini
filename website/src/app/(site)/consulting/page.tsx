import type { Metadata } from 'next'
import { ConsultingContent } from '@/components/pages/ConsultingContent'

export const metadata: Metadata = {
  title: '1v1 咨询 · 把自媒体获客的真问题讲清',
  description:
    '60 分钟单次连麦咨询：针对个人 IP、实体老板与专业人士的自媒体增长卡点，给到结构化结论与下一步动作，配合微域生光的赛道分析、博主拆解与 AI 信息工具更顺手。',
  openGraph: {
    title: '咨询服务 · 微域生光',
    description: '60 分钟连麦，把 AI × 自媒体获客的真问题讲清。',
  },
}

export default function ConsultingPage() {
  return <ConsultingContent />
}
