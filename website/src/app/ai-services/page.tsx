import type { Metadata } from 'next'
import { AiServicesContent } from '@/components/pages/AiServicesContent'

export const metadata: Metadata = {
  title: 'AI+服务 · 与经营者与创业者共同推进 IP 与品牌资产',
  description:
    '三条服务路径：IP 定位 · IP 生产系统 · 长期策略顾问。覆盖 IP 从定位到沉淀的完整周期。',
  openGraph: {
    title: 'AI+服务 | 微域生光',
    description:
      '三条服务路径：IP 定位 · IP 生产系统 · 长期策略顾问。',
  },
}

export default function AiServicesPage() {
  return <AiServicesContent />
}
