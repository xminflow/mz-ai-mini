import type { Metadata } from 'next'

import { TrackInsightListContent } from '@/components/tracks'
import { TrackAnalysisFetchError, fetchTrackAnalysisList } from '@/services/track-analysis'

export const metadata: Metadata = {
  title: '赛道分析 · 消除信息差，找准真方向',
  description:
    '每一份赛道分析包含 6 份子报告：执行摘要 / 行业研判 / 竞争格局 / 商业模式 / AI 落地 / 操盘手册。基于公开权威数据，用投研级框架还原，帮你判断「能不能切、怎么切」。',
  openGraph: {
    title: '赛道分析 · 微域生光',
    description: '用投研级框架拆解每个自媒体赛道，消除信息差，找准真方向。',
  },
}

interface TracksPageProps {
  searchParams?: Promise<{
    industry?: string
    stance?: string
    keyword?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function TracksPage({ searchParams }: TracksPageProps) {
  const resolved = (await searchParams) ?? {}
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

function normalize(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const stripped = value.trim()
  return stripped === '' ? undefined : stripped
}
