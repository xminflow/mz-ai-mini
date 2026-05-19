import type { Metadata } from 'next'
import { ProductContent } from '@/components/pages/ProductContent'

export const metadata: Metadata = {
  title: '产品 · 把「看懂别人」变成「自己能做」',
  description:
    '真实的案例 + AI 工具——粘贴一条链接，10 秒看懂它为什么火；按你关心的赛道，持续给你同类的拆解。素材拆解 · 博主洞察 · 选题灵感。',
  openGraph: {
    title: '产品 | 微域生光',
    description: '粘贴一条链接，10 秒看懂它为什么火。',
  },
}

export default function ProductPage() {
  return <ProductContent />
}
