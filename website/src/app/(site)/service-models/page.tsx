import type { Metadata } from 'next'
import { ServiceModelsContent } from '@/components/pages/service-models/ServiceModelsContent'

// 与首页同理：不定义 openGraph，避免整体替换掉根 layout 的 images 等字段。
export const metadata: Metadata = {
  title: '服务模式',
  description:
    '软件定制的两种合作模式：需求已经清楚就走「先定清单」，逐项功能报价、对照清单验收；需求还说不清就走「边做边定」，按周计价、每周确认。七步流程每步都写明你能拿到什么、多久、要不要付钱。',
}

export default function ServiceModelsPage() {
  return <ServiceModelsContent />
}
