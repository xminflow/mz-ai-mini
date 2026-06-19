import type { Metadata } from 'next'
import { AiCodingCampContent } from '@/components/pages/AiCodingCampContent'

export const metadata: Metadata = {
  title: 'AI 编程实战训练营 · 零基础入门 + AI 编程专家',
  description:
    '两门课覆盖两类人群:零基础 AI 编程(¥1999)带你从零做出能上线的网页与小程序;AI 编程专家(¥3999,含第一阶段全部)带你打通企业级 AI 工程、两套实战系统与求职面试。',
  openGraph: {
    title: 'AI 编程实战训练营 · 微域生光',
    description: '零基础入门 + AI 编程专家,两门课各得其所,完整学习路径与收获一目了然。',
  },
}

export default function HomePage() {
  return <AiCodingCampContent />
}
