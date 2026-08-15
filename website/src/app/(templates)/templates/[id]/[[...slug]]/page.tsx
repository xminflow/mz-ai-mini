import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getSurfaceById,
  getSurfacePage,
  getTemplateById,
} from '@/features/site-templates/registry'

interface RouteParams {
  id: string
  slug?: string[]
}

interface ResolvedRoute {
  surfaceId: string
  pageSlug: string
}

/**
 * catch-all 拿到的是路径片段数组。第一段固定是端 id，其余拼回页面 slug。
 *
 * 端片段不省略——哪怕模板只有一个端也要写在 URL 里。省略会让解析出现两种分支
 * （第一段可能是端也可能是页面），一旦某个端 id 与某个页面 slug 同名就必然误判。
 */
function resolveRoute(slug: string[] | undefined): ResolvedRoute | null {
  if (!slug || slug.length === 0) return null
  const [surfaceId, ...rest] = slug
  return { surfaceId, pageSlug: rest.join('/') }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { id, slug } = await params
  const template = getTemplateById(id)
  if (!template) return {}

  const route = resolveRoute(slug)
  const surface = route ? getSurfaceById(template, route.surfaceId) : undefined
  const page = surface && route ? getSurfacePage(surface, route.pageSlug) : undefined

  return {
    // 用 absolute 覆盖根 layout 的 title.template：模板站点不该被追加「· 微域生光」后缀。
    title: { absolute: page ? `${page.title} · ${template.name}` : template.name },
    robots: { index: false, follow: false },
  }
}

export default async function TemplateSitePage({ params }: { params: Promise<RouteParams> }) {
  const { id, slug } = await params

  const template = getTemplateById(id)
  if (!template) notFound()

  // 裸 /templates/<id> 不渲染任何东西：没有端片段就无从判断该展示哪个站。
  // 入口一律由工作台的预览页给出，那里的链接始终带端。
  const route = resolveRoute(slug)
  if (!route) notFound()

  const surface = getSurfaceById(template, route.surfaceId)
  if (!surface) notFound()

  const page = getSurfacePage(surface, route.pageSlug)
  if (!page) notFound()

  const { default: PageComponent } = await page.load()

  // data-template 是该模板 theme.css 的作用域锚点：令牌与底色只在这个子树内生效。
  // basePath 交给模板自己拼站内链接，模板内部不感知自己被挂在 /templates 下。
  return (
    <div data-template={template.id} className="min-h-screen">
      <PageComponent basePath={`/templates/${template.id}/${surface.id}`} />
    </div>
  )
}
