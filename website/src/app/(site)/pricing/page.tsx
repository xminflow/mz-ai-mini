import type { Metadata } from 'next'

import { PricingHero } from '@/features/membership/PricingHero'

export const metadata: Metadata = {
  title: '年度会员 ¥499 · 解锁 AI × 自媒体获客四项硬核权益',
  description:
    '微域生光年度会员 ¥499/年：百万博主运营方法论精炼 · 一线博主拆解 · 赛道深度分析 · 桌面端本地素材采集智能体。微信扫码支付，即时生效。',
  openGraph: {
    title: '年度会员 · 微域生光',
    description: '¥499/年解锁 AI × 自媒体获客四项硬核权益。',
  },
}

export default function PricingPage() {
  return <PricingHero />
}
