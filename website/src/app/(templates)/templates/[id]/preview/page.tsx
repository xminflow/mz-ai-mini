import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getSurfaceById,
  getSurfacePage,
  getTemplateById,
} from '@/features/site-templates/registry'
import { PreviewFrame } from '@/features/site-templates/workbench/PreviewFrame'
import { TEMPLATE_PLATFORM_LABELS } from '@/features/site-templates/types'

interface RouteParams {
  id: string
}

interface PreviewSearchParams {
  // Next.js 对重复的同名 query（如 ?page=a&page=b）在运行时会给出 string[]，
  // 而不是 string；只声明 string 会让类型系统对这种输入撒谎。
  surface?: string | string[]
  page?: string | string[]
}

/** 重复传参（?page=a&page=b）视同未传：绝不能让数组静默流进字符串比较。 */
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
  const { surface: requestedSurface, page: requestedSlug } = await searchParams

  const template = getTemplateById(id)
  if (!template) notFound()

  // 不带 ?surface 时预览第一个端；注册表保证 surfaces 非空
  const surfaceId = readParam(requestedSurface)
  const activeSurface = surfaceId ? getSurfaceById(template, surfaceId) : template.surfaces[0]
  if (!activeSurface) notFound()

  const activeSlug = readParam(requestedSlug) ?? ''
  const activePage = getSurfacePage(activeSurface, activeSlug)
  if (!activePage) notFound()

  const surfaceBase = `/templates/${template.id}/${activeSurface.id}`
  const previewSrc = `${surfaceBase}${activeSlug ? `/${activeSlug}` : ''}`

  /**
   * 窗口地址栏里显示的是一个示意域名，不是模板在本站的真实路径。
   * 路径形如 /templates/aegis/site 会立刻暴露"这是嵌在别人站里的一个页面"，
   * 而这块窗口要传达的恰恰相反——框里是一个独立的站点。
   * 域名用 IANA 保留给文档示例的 example.com 子域，不会撞上任何真实机构。
   * 多端时用端 id 做子域，让「官网」与「后台」在地址栏里也是两个站。
   */
  const mockHost =
    template.surfaces.length > 1
      ? `${activeSurface.id}.${template.id}.example.com`
      : `${template.id}.example.com`
  const mockAddress = `${mockHost}${activeSlug ? `/${activeSlug}` : ''}`

  const previewHref = (targetSurfaceId: string, targetSlug: string) => {
    const query = new URLSearchParams({ surface: targetSurfaceId })
    if (targetSlug) query.set('page', targetSlug)
    return `/templates/${template.id}/preview?${query.toString()}`
  }

  const tabClass = (isActive: boolean) =>
    isActive
      ? 'relative pb-2 text-[14px] text-graphite'
      : 'relative pb-2 text-[14px] text-graphite-dim transition hover:text-graphite'

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

      {/* 端切换只在多端时出现：只有一个端时这一行是恒定的单个标签，纯占位。
          切端一律回落到该端首页——两个端的页面 slug 没有对应关系，
          带着当前 slug 切过去多半直接 404。 */}
      {template.surfaces.length > 1 ? (
        <nav aria-label="切换端" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {template.surfaces.map((surface) => {
            const isActive = surface.id === activeSurface.id
            return (
              <Link
                key={surface.id}
                href={previewHref(surface.id, '')}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'rounded-btn border border-blue px-3 py-1.5 text-[13px] text-graphite'
                    : 'rounded-btn border border-rule px-3 py-1.5 text-[13px] text-graphite-dim transition hover:border-rule-strong hover:text-graphite'
                }
              >
                {surface.name}
                <span className="ml-2 text-graphite-dim">
                  {TEMPLATE_PLATFORM_LABELS[surface.platform]}
                </span>
              </Link>
            )
          })}
        </nav>
      ) : null}

      {/* 选中态的下划线取模板自己的强调色：工作台的彩色一律来自它正在陈列的那套模板 */}
      <nav aria-label="切换页面" className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {activeSurface.pages.map((page) => {
          const isActive = page.slug === activeSlug
          return (
            <Link
              key={page.slug}
              href={previewHref(activeSurface.id, page.slug)}
              aria-current={isActive ? 'page' : undefined}
              className={tabClass(isActive)}
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
          title={`${template.name} - ${activeSurface.name} - ${activePage.title}`}
          address={mockAddress}
          accentColor={template.accentColor}
        />
      </div>
    </main>
  )
}
