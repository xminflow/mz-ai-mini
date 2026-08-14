import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTemplateById, getTemplatePage } from '@/features/site-templates/registry'

interface RouteParams {
  id: string
  slug?: string[]
}

/** catch-all 拿到的是路径片段数组，注册表里存的是完整 slug 字符串，这里做一次归一。 */
function resolveSlug(slug: string[] | undefined): string {
  return slug?.join('/') ?? ''
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { id, slug } = await params
  const template = getTemplateById(id)
  if (!template) return {}

  const page = getTemplatePage(template, resolveSlug(slug))

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

  const page = getTemplatePage(template, resolveSlug(slug))
  if (!page) notFound()

  const { default: PageComponent } = await page.load()

  // data-template 是该模板 theme.css 的作用域锚点：令牌与底色只在这个子树内生效。
  // basePath 交给模板自己拼站内链接，模板内部不感知自己被挂在 /templates 下。
  return (
    <div data-template={template.id} className="min-h-screen">
      <PageComponent basePath={`/templates/${template.id}`} />
    </div>
  )
}
