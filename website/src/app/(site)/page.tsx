import type { Metadata } from 'next'
import { HomeContent } from '@/components/pages/home/HomeContent'

// 这里刻意不定义 openGraph：Next.js 的 openGraph 是「整体替换」而非深合并，
// 页面级只写 title/description 会把根 layout 的 images、siteName、locale、type、url
// 一并顶掉，导致首页分享时没有封面图。OG 信息统一由根 layout 提供。
export const metadata: Metadata = {
  // 后缀「· 微域生光」由根 layout 的 title.template 统一追加，这里不能再自带，否则会拼成两遍。
  title: '软件定制服务',
  description:
    '官网、企业级管理系统、小程序、AI 智能体、AI 知识库、数据分析看板、SaaS 平台、电商系统、桌面客户端、系统集成——AI 原生全栈自研，设计到交互全流程闭环，高效高质量交付。',
}

export default function HomePage() {
  return <HomeContent />
}
