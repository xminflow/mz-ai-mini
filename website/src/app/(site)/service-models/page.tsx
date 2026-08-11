import type { Metadata } from 'next'
import { ServiceModelsContent } from '@/components/pages/service-models/ServiceModelsContent'

// 与首页同理：不定义 openGraph，避免整体替换掉根 layout 的 images 等字段。
export const metadata: Metadata = {
  title: '服务模式',
  description:
    '软件定制的七步合作流程：先聊一次、功能清单与逐项报价、签合同建项目群、每周给你一个能上手试的版本、对照清单逐项验收、上线并把源码全部交给你、一年免费维保。每一步都写明你能拿到什么、多久、要不要付钱。',
}

export default function ServiceModelsPage() {
  return <ServiceModelsContent />
}
