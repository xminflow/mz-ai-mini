import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicColumn, getPublicColumnSlugs } from '@/lib/mock/content'

export const revalidate = 3600

export function generateStaticParams() {
  return getPublicColumnSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const column = getPublicColumn(slug)
  if (!column) return {}
  return {
    title: column.title,
    description: column.description,
    openGraph: { title: column.title, description: column.description, type: 'website' },
  }
}

export default async function ColumnDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const column = getPublicColumn(slug)
  if (!column) notFound()
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-medium text-ink">{column.title}</h1>
      <p className="mt-3 text-sm text-mute">{column.description}</p>
      <div className="mt-8 leading-relaxed text-ink-2">{column.body}</div>
    </article>
  )
}
