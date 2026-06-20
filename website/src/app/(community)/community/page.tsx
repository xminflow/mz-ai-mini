import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 学习社区',
}

export default function CommunityHomePage() {
  return (
    <div className="flex h-full items-center justify-center text-muted">
      请从左侧目录选择一篇内容
    </div>
  )
}
