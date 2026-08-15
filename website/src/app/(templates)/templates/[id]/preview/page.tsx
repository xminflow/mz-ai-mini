import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTemplateById, getTemplatePage } from '@/features/site-templates/registry'
import { PreviewFrame } from '@/features/site-templates/workbench/PreviewFrame'

interface RouteParams {
  id: string
}

interface PreviewSearchParams {
  // Next.js 对重复的同名 query（如 ?page=a&page=b）在运行时会给出 string[]，
  // 而不是 string；只声明 string 会让类型系统对这种输入撒谎。
  page?: string | string[]
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
  const { page: requestedSlug } = await searchParams

  const template = getTemplateById(id)
  if (!template) notFound()

  // 不带 ?page 时预览首页（slug 为空串）；重复传参（?page=a&page=b）时视同未传，
  // 回落到首页——绝不能让数组静默流进 getTemplatePage 做字符串比较。
  const activeSlug = typeof requestedSlug === 'string' ? requestedSlug : ''
  const activePage = getTemplatePage(template, activeSlug)
  if (!activePage) notFound()

  const previewSrc = `/templates/${template.id}${activeSlug ? `/${activeSlug}` : ''}`

  /**
   * 窗口地址栏里显示的是一个示意域名，不是模板在本站的真实路径。
   * 路径形如 /templates/aegis 会立刻暴露"这是嵌在别人站里的一个页面"，
   * 而这块窗口要传达的恰恰相反——框里是一个独立的站点。
   * 域名用 IANA 保留给文档示例的 example.com 子域，不会撞上任何真实机构。
   */
  const mockAddress = `${template.id}.example.com${activeSlug ? `/${activeSlug}` : ''}`

  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 pb-24 pt-14 sm:px-10">
      <Link
        href="/templates"
        className="font-mono text-[12px] tracking-[0.14em] text-graphite-dim transition hover:text-graphite"
      >
        ← 工作台
      </Link>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-rule pb-8">
        <div>
          <h1 className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
            {template.name}
          </h1>
        </div>
        <a
          href={previewSrc}
          target="_blank"
          rel="noreferrer"
          className="text-[14px] text-graphite-dim transition hover:text-graphite"
        >
          在新标签打开 ↗
        </a>
      </div>

      {/* 选中态的下划线取模板自己的强调色：工作台的彩色一律来自它正在陈列的那套模板 */}
      <nav className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {template.pages.map((page) => {
          const href = page.slug
            ? `/templates/${template.id}/preview?page=${page.slug}`
            : `/templates/${template.id}/preview`
          const isActive = page.slug === activeSlug
          return (
            <Link
              key={page.slug}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'relative pb-2 text-[14px] text-graphite'
                  : 'relative pb-2 text-[14px] text-graphite-dim transition hover:text-graphite'
              }
            >
              {page.title}
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px]"
                  style={{ backgroundColor: template.accentColor }}
                />
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="mt-10">
        <PreviewFrame
          src={previewSrc}
          title={`${template.name} - ${activePage.title}`}
          address={mockAddress}
          accentColor={template.accentColor}
        />
      </div>
    </main>
  )
}
