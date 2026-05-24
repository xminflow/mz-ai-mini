import type { Metadata } from 'next'

import { PricingHero } from '@/features/membership/PricingHero'

export const metadata: Metadata = {
  title: '年度会员 ¥199 起 · 解锁 AI × 自媒体获客核心权益',
  description:
    '微域生光年度会员：普通会员 ¥199/年（每月博主拆解+赛道分析各3份）· 高级会员 ¥499/年（各10份 + 本地采集智能体）。微信扫码支付，即时生效。',
  openGraph: {
    title: '年度会员 · 微域生光',
    description: '¥199/年起，解锁 AI × 自媒体获客核心权益。',
  },
}

export default function PricingPage() {
  return <PricingHero />
}
