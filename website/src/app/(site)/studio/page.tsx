// src/app/(site)/studio/page.tsx
import type { Metadata } from 'next'
import { StudioContent } from '@/components/pages/StudioContent'

export const metadata: Metadata = {
  title: '研发团队 · 微域生光',
  description:
    '一家模拟公司的研发团队：CTO 亲自带队，5 个研发部门各自负责一个真实项目，每个部门 5 人编制，欢迎加入。',
  openGraph: {
    title: '研发团队 · 微域生光',
    description: 'CTO 带队的模拟研发团队，5 个部门、5 个真实项目，虚位以待你的加入。',
  },
}

export default function StudioPage() {
  return <StudioContent />
}
