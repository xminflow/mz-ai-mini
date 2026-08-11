import type { Metadata } from 'next'
import { HomeContent } from '@/components/pages/home/HomeContent'

export const metadata: Metadata = {
  title: '软件定制服务 · 微域生光',
  description:
    '官网、企业级管理系统、小程序、AI 智能体、AI 知识库、数据分析看板、SaaS 平台、电商系统、桌面客户端、系统集成——AI 原生全栈自研，设计到交互全流程闭环，高效高质量交付。',
  openGraph: {
    title: '软件定制服务 · 微域生光',
    description: '从需求梳理到上线运营，全流程闭环为你的业务保驾护航，最大程度节省你的时间成本——官网、企业系统、AI 智能体等 11 类软件定制服务。',
  },
}

export default function HomePage() {
  return <HomeContent />
}
