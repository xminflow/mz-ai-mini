import type { Metadata } from 'next'
import { AiCodingCampContent } from '@/components/pages/AiCodingCampContent'

export const metadata: Metadata = {
  title: 'AI架构师训练营 · 零基础入门 + AI 架构师',
  description:
    '两门课覆盖两类人群:AI 编程入门(¥1999)带你从零做出能上线的网页与小程序;AI 架构师(¥4999,含第一阶段全部)带你打通企业级 AI 工程、两套实战系统与求职面试。',
  openGraph: {
    title: 'AI架构师训练营 · 微域生光',
    description: '零基础入门 + AI 架构师,两门课各得其所,完整学习路径与收获一目了然。',
  },
}

export default function HomePage() {
  return <AiCodingCampContent />
}
