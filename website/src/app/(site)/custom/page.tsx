import type { Metadata } from 'next'
import { CustomSoftwareContent } from '@/components/pages/CustomSoftwareContent'

export const metadata: Metadata = {
  title: '软件定制服务 · 微域生光',
  description:
    '官网、企业级管理系统、小程序、AI 智能体、AI 知识库、数据分析看板、SaaS 平台、电商系统、桌面客户端、系统集成——AI 原生全栈自研，设计到交互全流程闭环，高效高质量交付。',
  openGraph: {
    title: '软件定制服务 · 微域生光',
    description: '从想法到上线，一个团队全包：官网、企业系统、AI 智能体等 11 类软件定制服务。',
  },
}

export default function CustomSoftwarePage() {
  return <CustomSoftwareContent />
}
