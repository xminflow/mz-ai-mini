import 'server-only'

import type {
  BloggerInsightDetail,
  BloggerInsightListResult,
} from '@/types/blogger-insight'

const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.weelume.com/api/v1'
const REQUEST_TIMEOUT_MS = 15000
const SUCCESS_CODE = 'COMMON.SUCCESS'

type UpstreamEnvelope<T> = {
  code?: unknown
  message?: unknown
  data?: T
}

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveBloggerInsightApiBaseUrl(): string {
  const explicit = process.env.WEBSITE_API_BASE_URL?.trim()
  if (explicit) return trimTrailingSlashes(explicit)
  const internalOrigin = process.env.INTERNAL_API_URL?.trim()
  if (internalOrigin) return `${trimTrailingSlashes(internalOrigin)}/api/v1`
  return process.env.NODE_ENV === 'production'
    ? DEFAULT_PRODUCTION_API_BASE_URL
    : DEFAULT_DEV_API_BASE_URL
}

export class BloggerInsightFetchError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, options: { status: number; code: string }) {
    super(message)
    this.name = 'BloggerInsightFetchError'
    this.status = options.status
    this.code = options.code
  }
}

interface ListQuery {
  limit?: number
  cursor?: string
  platform?: string
  industry?: string
  keyword?: string
}

function buildQueryString(query: ListQuery): string {
  const params = new URLSearchParams()
  if (query.limit !== undefined) params.set('limit', String(query.limit))
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.platform) params.set('platform', query.platform)
  if (query.industry) params.set('industry', query.industry)
  if (query.keyword) params.set('keyword', query.keyword)
  const text = params.toString()
  return text ? `?${text}` : ''
}

async function requestJson<T>(path: string): Promise<T> {
  const url = `${resolveBloggerInsightApiBaseUrl()}${path}`
  let response: Response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch {
    throw new BloggerInsightFetchError('博主洞察服务暂时不可用', {
      status: 503,
      code: 'BLOGGER_INSIGHT.UPSTREAM_UNREACHABLE',
    })
  }

  const envelope = (await response.json().catch(() => ({}))) as UpstreamEnvelope<T>
  if (!response.ok || envelope.code !== SUCCESS_CODE || envelope.data === undefined) {
    throw new BloggerInsightFetchError(
      typeof envelope.message === 'string' ? envelope.message : '博主洞察请求失败',
      {
        status: response.status || 500,
        code:
          typeof envelope.code === 'string'
            ? envelope.code
            : 'BLOGGER_INSIGHT.UPSTREAM_ERROR',
      },
    )
  }
  return envelope.data
}

export async function fetchBloggerInsightList(
  query: ListQuery = {},
): Promise<BloggerInsightListResult> {
  return requestJson<BloggerInsightListResult>(
    `/blogger-insights${buildQueryString(query)}`,
  )
}

export async function fetchBloggerInsightDetail(
  slug: string,
): Promise<BloggerInsightDetail> {
  const encoded = encodeURIComponent(slug)
  return requestJson<BloggerInsightDetail>(`/blogger-insights/${encoded}`)
}
