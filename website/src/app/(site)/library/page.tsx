import type { Metadata } from 'next'
import { LibraryHubContent } from '@/components/library'
import { TrackInsightListContent } from '@/components/tracks'
import { fetchLibraryHubData } from '@/services/library'
import {
  TrackAnalysisFetchError,
  fetchTrackAnalysisList,
} from '@/services/track-analysis'

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
    const industry = normalize(resolved.industry)
    const stance = normalize(resolved.stance)
    const keyword = normalize(resolved.keyword)
    let listResult
    let errorMessage: string | null = null
    try {
      listResult = await fetchTrackAnalysisList({
        limit: 24,
        industry,
        stance,
        keyword,
      })
    } catch (error) {
      listResult = {
        items: [],
        next_cursor: null,
        available_industries: [],
        available_stances: [],
      }
      errorMessage =
        error instanceof TrackAnalysisFetchError
          ? error.message
          : '赛道分析暂时无法加载，请稍后再试。'
    }
    return (
      <TrackInsightListContent
        listResult={listResult}
        industry={industry}
        stance={stance}
        keyword={keyword}
        errorMessage={errorMessage}
      />
    )
  }

  const data = await fetchLibraryHubData()
  return <LibraryHubContent data={data} />
}

function normalize(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const stripped = value.trim()
  return stripped === '' ? undefined : stripped
}
