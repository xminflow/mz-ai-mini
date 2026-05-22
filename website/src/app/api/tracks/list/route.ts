import { NextResponse } from 'next/server'

import {
  TrackAnalysisFetchError,
  fetchTrackAnalysisList,
} from '@/services/track-analysis'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 60

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const limit = parseLimit(url.searchParams.get('limit'))
  const cursor = optional(url.searchParams.get('cursor'))
  const industry = optional(url.searchParams.get('industry'))
  const stance = optional(url.searchParams.get('stance'))
  const keyword = optional(url.searchParams.get('keyword'))

  try {
    const result = await fetchTrackAnalysisList({
      limit,
      cursor,
      industry,
      stance,
      keyword,
    })
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    if (error instanceof TrackAnalysisFetchError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status || 500 },
      )
    }
    return NextResponse.json(
      { error: { code: 'TRACK_ANALYSIS.UNKNOWN', message: '赛道分析暂时无法加载' } },
      { status: 500 },
    )
  }
}

function parseLimit(raw: string | null): number {
  if (raw === null) return DEFAULT_LIMIT
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(parsed), MAX_LIMIT)
}

function optional(value: string | null): string | undefined {
  if (value === null) return undefined
  const stripped = value.trim()
  return stripped === '' ? undefined : stripped
}
