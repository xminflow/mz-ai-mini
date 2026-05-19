import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LibraryDetail } from '@/components/library'
import { fetchLibraryItem, fetchRelatedItems } from '@/services/library'

interface LibraryItemPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: LibraryItemPageProps): Promise<Metadata> {
  const { id } = await params
  const item = fetchLibraryItem(id)
  if (!item) return { title: '内容未找到' }
  return {
    title: item.title,
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
    },
  }
}

export default async function LibraryItemPage({ params }: LibraryItemPageProps) {
  const { id } = await params
  const item = fetchLibraryItem(id)
  if (!item) notFound()
  const related = fetchRelatedItems(id, 3)
  return <LibraryDetail item={item} related={related} />
}
