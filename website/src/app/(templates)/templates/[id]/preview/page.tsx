import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSurfaceById, getTemplateById } from '@/features/site-templates/registry'
import { PreviewStage } from '@/features/site-templates/workbench/PreviewStage'
import { TEMPLATE_PLATFORM_LABELS } from '@/features/site-templates/types'
import { isTemplateDevice } from '@/features/site-templates/devices'

interface RouteParams {
  id: string
}

interface PreviewSearchParams {
  // Next.js 对重复的同名 query（如 ?surface=a&surface=b）在运行时会给出 string[]，
  // 而不是 string；只声明 string 会让类型系统对这种输入撒谎。
  surface?: string | string[]
  viewport?: string | string[]
}

/** 重复传参视同未传：绝不能让数组静默流进字符串比较。 */
function readParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { id } = await params
  const template = getTemplateById(id)
  return { title: { absolute: template ? `预览 · ${template.name}` : '预览' } }
}

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<PreviewSearchParams>
}) {
  const { id } = await params
  const { surface: requestedSurface, viewport: requestedViewport } = await searchParams

  const template = getTemplateById(id)
  if (!template) notFound()

  // 不带 ?surface 时预览第一个端；注册表保证 surfaces 非空
  const surfaceId = readParam(requestedSurface)
  const activeSurface = surfaceId ? getSurfaceById(template, surfaceId) : template.surfaces[0]
  if (!activeSurface) notFound()
  const viewport = readParam(requestedViewport)
  if (viewport !== undefined && !isTemplateDevice(viewport)) notFound()

  /**
   * 预览一律从该端首页进，**不提供页面切换**。
   *
   * 模板站点自己就有导航（官网的顶部菜单、控制台的侧边栏），预览页顶上再列一遍全部页面
   * 是同一件事说两遍；更重要的是，客户要判断的恰恰是"这套东西自己好不好用"，
   * 让他用模板自己的导航翻页才是真实体验，外挂一排 tab 反而把这一点遮住了。
   *
   * 代价明确：模板必须自带能覆盖全部页面的站内导航，否则某些页面在预览里点不到。
   * 这条写进了 README 的约束，新增模板时要自查。
   */
  const previewSrc = `/templates/${template.id}/${activeSurface.id}`

  return (
    <PreviewStage
      templateId={template.id}
      src={previewSrc}
      title={`${template.name} - ${activeSurface.name}`}
      accentColor={template.accentColor}
      surfaces={template.surfaces.map((surface) => ({
        id: surface.id,
        name: surface.name,
        platformLabel: TEMPLATE_PLATFORM_LABELS[surface.platform],
      }))}
      activeSurfaceId={activeSurface.id}
      initialViewport={isTemplateDevice(viewport) ? viewport : activeSurface.platform === 'pc' ? 'desktop' : 'mobile'}
    />
  )
}
