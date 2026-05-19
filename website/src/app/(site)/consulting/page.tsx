import type { Metadata } from 'next'
import { ConsultingContent } from '@/components/pages/ConsultingContent'

export const metadata: Metadata = {
  title: '咨询服务 · 当工具帮不到、内容看不够',
  description:
    '60 分钟单次连麦咨询。预约付费咨询，把自媒体获客的真问题讲清。',
  openGraph: {
    title: '咨询服务 | 微域生光',
    description: '60 分钟单次连麦咨询，针对你眼下的卡点给到结构化结论。',
  },
}

export default function ConsultingPage() {
  return <ConsultingContent />
}
