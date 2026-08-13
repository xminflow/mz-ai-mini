import type { Metadata } from 'next'
import { AiCodingCampContent } from '@/components/pages/AiCodingCampContent'

export const metadata: Metadata = {
  title: 'AI架构师训练营 · 企业级 AI 工程与求职进阶',
  description:
    'AI 架构师(限时特价 ¥3999,原价 ¥5999)带你打通企业级 AI 工程:能力进阶、两套企业级实战系统直播、求职面试冲刺,一条主线跟到拿下 offer。',
  openGraph: {
    title: 'AI架构师训练营 · 微域生光',
    description: 'AI 架构师进阶主线,完整学习路径与收获一目了然。',
  },
}

export default function AiCodingCampPage() {
  return <AiCodingCampContent />
}
