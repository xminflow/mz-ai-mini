import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SectionHeading } from '@/components/ui'
import { TemplateRow } from '@/features/site-templates/workbench/TemplateRow'
import { getTemplatesByScene } from '@/features/site-templates/gallery/selectors'
import { SceneFallback } from '@/features/site-templates/scenes/_shared/SceneFallback'
import { getSceneById } from '@/features/site-templates/taxonomy'

// Next.js 15：动态段参数是 Promise，必须 await
type ScenePageProps = { params: Promise<{ scene: string }> }

export async function generateMetadata({ params }: ScenePageProps): Promise<Metadata> {
  const { scene: sceneId } = await params
  const scene = getSceneById(sceneId)
  if (!scene) return {}

  return {
    title: scene.name,
    description: `微域生光的${scene.name}项目案例与做法。`,
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
  // 只有场景清单里没有这个 id 才 404。场景本身没有已上架的模板不是错误状态——
  // 侧栏列出全部 15 个场景，每一项都必须点得开，它表达的是业务范围而不是当前库存
  if (!scene) notFound()

  const templates = getTemplatesByScene(sceneId)
  const Section = scene.load ? (await scene.load()).default : null

  return (
    <>
      <SectionHeading as="h1" eyebrow="Cases" title={scene.name} align="left" />

      {/* Section 插槽只接收可序列化字段：TemplateScene 带 load 函数，不能整体传给可能是
          'use client' 的场景自定义区，见 taxonomy.ts 的 SceneSummary 说明 */}
      {Section ? (
        <Section scene={{ id: scene.id, name: scene.name }} templateCount={templates.length} />
      ) : (
        <SceneFallback sceneName={scene.name} />
      )}

      {templates.length > 0 && (
        <div className="mt-12">
          {templates.map((template) => (
            <TemplateRow key={template.id} template={template} />
          ))}
        </div>
      )}
    </>
  )
}
