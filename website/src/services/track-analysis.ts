import 'server-only'

import type {
  TrackAnalysisDetail,
  TrackAnalysisListResult,
  TrackReportContent,
} from '@/types/track-analysis'

const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.weelume.com/api/v1'
const REQUEST_TIMEOUT_MS = 15000
const SUCCESS_CODE = 'COMMON.SUCCESS'

type UpstreamEnvelope<T> = {
  code?: unknown
  message?: unknown
  data?: T
  details?: Record<string, unknown> | null
}

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveTrackAnalysisApiBaseUrl(): string {
  const explicit = process.env.WEBSITE_API_BASE_URL?.trim()
  if (explicit) return trimTrailingSlashes(explicit)
  const internalOrigin = process.env.INTERNAL_API_URL?.trim()
  if (internalOrigin) return `${trimTrailingSlashes(internalOrigin)}/api/v1`
  return process.env.NODE_ENV === 'production'
    ? DEFAULT_PRODUCTION_API_BASE_URL
    : DEFAULT_DEV_API_BASE_URL
}

export class TrackAnalysisFetchError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, options: { status: number; code: string }) {
    super(message)
    this.name = 'TrackAnalysisFetchError'
    this.status = options.status
    this.code = options.code
  }
}


interface ListQuery {
  limit?: number
  cursor?: string
  industry?: string
  stance?: string
  keyword?: string
}

function buildQueryString(query: ListQuery): string {
  const params = new URLSearchParams()
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.industry) params.set('industry', query.industry)
  if (query.stance) params.set('stance', query.stance)
  if (query.keyword) params.set('keyword', query.keyword)
  const text = params.toString()
  return text ? `?${text}` : ''
}

async function requestJson<T>(path: string, accessToken?: string): Promise<T> {
  const url = `${resolveTrackAnalysisApiBaseUrl()}${path}`
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  let response: Response
  try {
    response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch {
    throw new TrackAnalysisFetchError('赛道分析服务暂时不可用', {
      status: 503,
      code: 'TRACK_ANALYSIS.UPSTREAM_UNREACHABLE',
    })
  }

  const envelope = (await response.json().catch(() => ({}))) as UpstreamEnvelope<T>
  if (!response.ok || envelope.code !== SUCCESS_CODE || envelope.data === undefined) {
    throw new TrackAnalysisFetchError(
      typeof envelope.message === 'string' ? envelope.message : '赛道分析请求失败',
      {
        status: response.status || 500,
        code:
          typeof envelope.code === 'string'
            ? envelope.code
            : 'TRACK_ANALYSIS.UPSTREAM_ERROR',
      },
    )
  }
  return envelope.data
}

export async function fetchTrackAnalysisList(
  query: ListQuery = {},
): Promise<TrackAnalysisListResult> {
  return requestJson<TrackAnalysisListResult>(
    `/track-analyses${buildQueryString(query)}`,
  )
}

export async function fetchTrackAnalysisDetail(
  slug: string,
): Promise<TrackAnalysisDetail> {
  const encoded = encodeURIComponent(slug)
  return requestJson<TrackAnalysisDetail>(`/track-analyses/${encoded}`)
}

export async function fetchTrackReportContent(
  slug: string,
  reportKey: string,
  accessToken?: string,
): Promise<TrackReportContent> {
  const encodedSlug = encodeURIComponent(slug)
  const encodedKey = encodeURIComponent(reportKey)
  return requestJson<TrackReportContent>(
    `/track-analyses/${encodedSlug}/reports/${encodedKey}`,
    accessToken,
  )
}
