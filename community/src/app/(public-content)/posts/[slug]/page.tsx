import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicPost, getPublicPostSlugs } from '@/lib/mock/content'

// ISR：每小时再生，兼顾 SEO/分享卡新鲜度与性能
export const revalidate = 3600

export function generateStaticParams() {
  return getPublicPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const post = getPublicPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  }
}

export default async function PostDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const post = getPublicPost(slug)
  if (!post) notFound()
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-medium text-ink">{post.title}</h1>
      <p className="mt-3 text-sm text-mute">
        {post.author} · {post.publishedAt}
      </p>
      <div className="mt-8 leading-relaxed text-ink-2">{post.body}</div>
    </article>
  )
}
