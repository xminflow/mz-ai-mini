import type { Metadata } from 'next'
import { MembershipContent } from '@/components/pages/MembershipContent'

export const metadata: Metadata = {
  title: '会员 · ¥199/年起解锁 AI × 自媒体获客四项硬核权益',
  description:
    '微域生光会员服务清单：百万博主运营方法论精炼 · 一线博主深度拆解 · 赛道深度分析 · 本地素材采集 AI 智能体。会员可免费提交博主拆解与赛道分析，把别人验证过的经验变成你的方法。',
  openGraph: {
    title: '会员 · 微域生光',
    description: '¥199/年起看清自己买到了什么——AI × 自媒体获客的四项硬核权益。',
  },
}

export default function MembershipPage() {
  return <MembershipContent />
}
