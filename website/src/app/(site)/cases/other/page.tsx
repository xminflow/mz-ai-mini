import type { Metadata } from 'next'

import { SectionHeading } from '@/components/ui'
import { OtherScenesContact } from '@/features/site-templates/gallery/OtherScenesContact'
import { getEmptyScenes } from '@/features/site-templates/gallery/selectors'

export const metadata: Metadata = {
  title: '其他场景',
  description: '电商、知识付费、进销存、预约到店等场景的项目样板正在陆续补齐，可先直接沟通。',
  // 必须显式覆盖：不写的话会继承根 layout 的 canonical: '/'，让这个页面对外声明自己是首页的重复内容
  alternates: {
    canonical: '/cases/other',
  },
}

export default function OtherScenesPage() {
  const scenes = getEmptyScenes()

  return (
    <>
      <SectionHeading
        as="h1"
        eyebrow="Cases"
        title="其他场景"
        description="下面这些场景我们都做过，只是可以公开展示的样板还在补。与其等我们补齐，不如直接说说你的业务——我们会拿最接近的项目跟你讲具体做法。"
        align="left"
      />

      {/* 用一列细线分隔的清单而不是标签墙：这里是「我们还能做什么」的说明，
          不是可点击的筛选项，做成一堆可点样式的色块会误导访客去点 */}
      <ul className="mt-10 max-w-md">
        {scenes.map((scene) => (
          <li
            key={scene.id}
            className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5"
          >
            <span className="text-[15px] text-graphite-soft">{scene.name}</span>
            <span className="text-[12.5px] text-graphite-dim">{scene.groupName}</span>
          </li>
        ))}
      </ul>

      <OtherScenesContact />
    </>
  )
}
