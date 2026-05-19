import type { Metadata } from 'next'

import { PricingHero } from '@/features/membership/PricingHero'

export const metadata: Metadata = {
  title: '年度会员',
  description: '开通微域生光年度会员，使用微信扫码支付并即时获得会员有效期。',
}

export default function PricingPage() {
  return <PricingHero />
}
