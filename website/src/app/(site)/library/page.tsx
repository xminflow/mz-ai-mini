import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LibraryHubContent } from '@/components/library'
import { fetchLibraryHubData } from '@/services/library'

export const metadata: Metadata = {
  title: '信息库 · 博主洞察 / 运营手册 / 爆款拆解 / 赛道分析',
  description:
    '微域生光信息库：一线博主洞察、百万博主运营手册、爆款内容拆解、赛道深度分析——四大板块把真实数据沉淀成 AI × 自媒体获客可上手的动作，消除信息差。',
  openGraph: {
    title: '信息库 · 微域生光',
    description: '四大板块沉淀真实跑出来的案例与方法，AI × 自媒体获客可上手。',
  },
}

export const dynamic = 'force-dynamic'

interface LibraryPageProps {
  searchParams?: Promise<{
    type?: string
    industry?: string
    stance?: string
    keyword?: string
  }>
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolved = (await searchParams) ?? {}
  const type = normalize(resolved.type)

  if (type === 'track') {
    const params = new URLSearchParams()
    if (resolved.industry) params.set('industry', resolved.industry)
    if (resolved.stance) params.set('stance', resolved.stance)
    if (resolved.keyword) params.set('keyword', resolved.keyword)
    const qs = params.toString()
    redirect(qs ? `/tracks?${qs}` : '/tracks')
  }

  const data = await fetchLibraryHubData()
  return <LibraryHubContent data={data} />
}

function normalize(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const stripped = value.trim()
  return stripped === '' ? undefined : stripped
}
