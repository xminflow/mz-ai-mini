import type { Metadata } from 'next'
import { CasesContent } from '@/components/pages/cases/CasesContent'

// 与首页同理：不定义 openGraph，避免整体替换掉根 layout 的 images 等字段。
export const metadata: Metadata = {
  title: '案例',
  description:
    '微域生光的软件定制项目案例。多数交付涉及客户业务数据与内部系统，需逐个取得授权后才能公开，因此案例正在陆续补齐；想先了解可直接联系我们。',
}

export default function CasesPage() {
  return <CasesContent />
}
