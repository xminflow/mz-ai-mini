import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于知识汇',
  description: '知识汇是一个把问题聊到通透的通用知识问答社区。了解我们的理念与玩法。',
}

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-2xl py-12">
      <h1 className="font-display text-4xl font-medium text-ink">关于知识汇</h1>
      <p className="mt-6 leading-relaxed text-ink-2">
        知识汇是一个通用知识问答社区。我们相信，每一个好问题都值得被认真讨论、被沉淀成可复用的知识。
      </p>
      <p className="mt-4 leading-relaxed text-mute">
        在这里，你可以提问、分享见解、加入感兴趣的专栏，与一群好奇的人一起把问题聊透。
      </p>
    </section>
  )
}
