import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTemplateById, getTemplatePage } from '@/features/site-templates/registry'
import { PreviewFrame } from '@/features/site-templates/workbench/PreviewFrame'

interface RouteParams {
  id: string
}

interface PreviewSearchParams {
  page?: string
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

  // 不带 ?page 时预览首页（slug 为空串）。
  const activeSlug = requestedSlug ?? ''
  const activePage = getTemplatePage(template, activeSlug)
  if (!activePage) notFound()

  const previewSrc = `/templates/${template.id}${activeSlug ? `/${activeSlug}` : ''}`

  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 py-10">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <Link
          href="/templates"
          className="text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          ← 工作台
        </Link>
        <h1 className="text-xl font-medium">{template.name}</h1>
        <span className="text-xs text-neutral-500">{template.industry}</span>
        <a
          href={previewSrc}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          新标签打开 ↗
        </a>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {template.pages.map((page) => {
          const href = page.slug
            ? `/templates/${template.id}/preview?page=${page.slug}`
            : `/templates/${template.id}/preview`
          return (
            <Link
              key={page.slug}
              href={href}
              className={
                page.slug === activeSlug
                  ? 'text-sm text-neutral-100'
                  : 'text-sm text-neutral-500 transition hover:text-neutral-300'
              }
            >
              {page.title}
            </Link>
          )
        })}
      </div>

      <div className="mt-8">
        <PreviewFrame src={previewSrc} title={`${template.name} - ${activePage.title}`} />
      </div>
    </main>
  )
}
