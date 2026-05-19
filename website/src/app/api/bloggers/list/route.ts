import { NextResponse } from 'next/server'

import {
  BloggerInsightFetchError,
  fetchBloggerInsightList,
} from '@/services/blogger-insights'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 24
const MAX_LIMIT = 60

// 客户端瀑布流分页用的 JSON 接口：把服务端 fetchBloggerInsightList 的能力暴露给浏览器。
// 后端 BloggerInsightFetchError 已经携带 status/code，这里如实透传。
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const limit = parseLimit(url.searchParams.get('limit'))
  const cursor = optional(url.searchParams.get('cursor'))
  const platform = optional(url.searchParams.get('platform'))
  const keyword = optional(url.searchParams.get('keyword'))

  try {
    const result = await fetchBloggerInsightList({ limit, cursor, platform, keyword })
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    if (error instanceof BloggerInsightFetchError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status || 500 },
      )
    }
    return NextResponse.json(
      { error: { code: 'BLOGGER_INSIGHT.UNKNOWN', message: '博主洞察暂时无法加载' } },
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
