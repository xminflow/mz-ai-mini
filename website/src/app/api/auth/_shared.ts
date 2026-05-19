import { NextResponse } from 'next/server'

import type { ApiErrorPayload } from '@/features/auth/types'
import { WebsiteAuthError } from '@/features/auth/server/backend'
import { readAuthCookies } from '@/features/auth/server/cookies'
import { getWebsiteAuthState } from '@/features/auth/server/session'

const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.weelume.com/api/v1'
const REQUEST_TIMEOUT_MS = 15000
const SUCCESS_CODE = 'COMMON.SUCCESS'

type UpstreamEnvelope<T> = {
  code?: unknown
  message?: unknown
  data?: T
}

export function authErrorResponse(error: unknown): NextResponse<ApiErrorPayload> {
  if (error instanceof WebsiteAuthError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status },
    )
  }

  return NextResponse.json(
    {
      error: {
        code: 'AUTH.INTERNAL_ERROR',
        message: '认证请求处理失败',
      },
    },
    { status: 500 },
  )
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveAuthApiBaseUrl(): string {
  const explicit = process.env.WEBSITE_API_BASE_URL?.trim()
  if (explicit) return trimTrailingSlashes(explicit)
  const internalOrigin = process.env.INTERNAL_API_URL?.trim()
  if (internalOrigin) return `${trimTrailingSlashes(internalOrigin)}/api/v1`
  return process.env.NODE_ENV === 'production'
    ? DEFAULT_PRODUCTION_API_BASE_URL
    : DEFAULT_DEV_API_BASE_URL
}

async function getAccessTokenOrThrow(): Promise<string> {
  const state = await getWebsiteAuthState()
  if (!state.authenticated) {
    throw new WebsiteAuthError('请先登录后再访问', { code: 'AUTH.REQUIRED', status: 401 })
  }
  const snapshot = await readAuthCookies()
  if (!snapshot.accessToken) {
    throw new WebsiteAuthError('登录状态无效，请重新登录', {
      code: 'AUTH.REQUIRED',
      status: 401,
    })
  }
  return snapshot.accessToken
}

/**
 * 转发需要 Bearer token 的 /agent-auth 接口；返回 envelope.data 或 envelope.error 形态。
 * 路径如 `/agent-auth/me/username`。
 */
export async function proxyAuthRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse<T | ApiErrorPayload>> {
  try {
    const accessToken = await getAccessTokenOrThrow()
    const response = await fetch(`${resolveAuthApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    })

    const envelope = (await response.json()) as UpstreamEnvelope<T>
    if (!response.ok || envelope.code !== SUCCESS_CODE || envelope.data === undefined) {
      return NextResponse.json(
        {
          error: {
            code: typeof envelope.code === 'string' ? envelope.code : 'AUTH.UPSTREAM_ERROR',
            message: typeof envelope.message === 'string' ? envelope.message : '请求失败',
          },
        },
        { status: response.status },
      )
    }
    return NextResponse.json(envelope.data)
  } catch (error) {
    return authErrorResponse(error)
  }
}
