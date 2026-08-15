import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SectionHeading } from '@/components/ui'
import { TemplateRow } from '@/features/site-templates/workbench/TemplateRow'
import { getTemplatesByScene } from '@/features/site-templates/gallery/selectors'
import { getGroupOfScene, getSceneById } from '@/features/site-templates/taxonomy'

// Next.js 15：动态段参数是 Promise，必须 await
type ScenePageProps = { params: Promise<{ scene: string }> }

export async function generateMetadata({ params }: ScenePageProps): Promise<Metadata> {
  const { scene: sceneId } = await params
  const scene = getSceneById(sceneId)
  if (!scene) return {}

  const group = getGroupOfScene(sceneId)
  return {
    title: scene.name,
    description: `微域生光的${group ? `${group.name} · ` : ''}${scene.name}项目样板。`,
    // 必须按实际 scene id 显式覆盖：不写的话会继承根 layout 的 canonical: '/'，
    // 每个场景页都会对外声明自己是首页的重复内容，与「场景页可独立索引」的设计前提矛盾
    alternates: {
      canonical: `/cases/${sceneId}`,
    },
  }
}

export default async function ScenePage({ params }: ScenePageProps) {
  const { scene: sceneId } = await params
  const scene = getSceneById(sceneId)
  if (!scene) notFound()

  const templates = getTemplatesByScene(sceneId)
  // 没有模板的场景不单独成页，只在「其他场景」里露出名字——
  // 一个只有介绍、下面空着的场景页比 404 更让人困惑
  if (templates.length === 0) notFound()

  // 有模板的场景必配 load，这条由 registry.ts 在加载时保证。
  // 这里仍显式抛错而不是用非空断言：真出现时要的是能定位的报错，不是 undefined is not a function
  if (!scene.load) {
    throw new Error(`[site-templates] 场景 ${sceneId} 有模板却没有自定义区 load`)
  }
  const { default: Section } = await scene.load()

  const group = getGroupOfScene(sceneId)

  return (
    <>
      <SectionHeading
        as="h1"
        eyebrow={group ? `Cases · ${group.name}` : 'Cases'}
        title={scene.name}
        align="left"
      />

      {/* Section 插槽只接收可序列化字段：TemplateScene 带 load 函数，不能整体传给可能是
          'use client' 的场景自定义区，见 taxonomy.ts 的 SceneSummary 说明 */}
      <Section scene={{ id: scene.id, name: scene.name }} templateCount={templates.length} />

      <div className="mt-12">
        {templates.map((template) => (
          <TemplateRow key={template.id} template={template} />
        ))}
      </div>
    </>
  )
}
