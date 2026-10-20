import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketplaceShell } from '@/features/site-templates/workbench/MarketplaceShell'
import { TemplateDetails } from '@/features/site-templates/workbench/TemplateDetails'
import { toTemplatePresentation } from '@/features/site-templates/workbench/presentation'
import { resolveSurfaceLocale, surfaceLocalePath } from '@/features/site-templates/locale-routing'
import {
  getTemplatesNewestFirst,
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
  const localized = surface && route ? resolveSurfaceLocale(surface, route.pageSlug) : undefined
  const page = surface && localized ? getSurfacePage(surface, localized.pageSlug) : undefined
  const locale = localized?.locale ?? 'zh'
  const name = template.localizedNames?.[locale] ?? template.name

  return {
    // 用 absolute 覆盖根 layout 的 title.template：模板站点不该被追加「· 微域生光」后缀。
    title: { absolute: page ? `${page.localizedTitles?.[locale] ?? page.title} · ${name}` : name },
    robots: { index: false, follow: false },
  }
}

export default async function TemplateSitePage({ params }: { params: Promise<RouteParams> }) {
  const { id, slug } = await params

  const template = getTemplateById(id)
  if (!template) notFound()

  // 裸模板路径承载详情；带端片段的真实模板路由继续按原规则解析。
  const route = resolveRoute(slug)
  if (!route) {
    return (
      <MarketplaceShell>
        <TemplateDetails
          template={toTemplatePresentation(template)}
          related={getTemplatesNewestFirst().filter((item) => item.id !== template.id).map(toTemplatePresentation)}
        />
      </MarketplaceShell>
    )
  }

  const surface = getSurfaceById(template, route.surfaceId)
  if (!surface) notFound()

  const { locale, pageSlug } = resolveSurfaceLocale(surface, route.pageSlug)
  const page = getSurfacePage(surface, pageSlug)
  if (!page) notFound()

  const { default: PageComponent } = await page.load()

  // data-template 是该模板 theme.css 的作用域锚点：令牌与底色只在这个子树内生效。
  // basePath 交给模板自己拼站内链接，模板内部不感知自己被挂在 /templates 下。
  return (
    <div data-template={template.id} lang={locale === 'en' ? 'en' : 'zh-CN'} className="min-h-screen">
      <PageComponent basePath={surfaceLocalePath(`/templates/${template.id}/${surface.id}`, locale)} locale={locale} />
    </div>
  )
}
