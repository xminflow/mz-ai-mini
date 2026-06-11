import { NextResponse } from 'next/server'

import { WebsiteAuthError } from '@/features/auth/server/backend'
import { readAuthCookies } from '@/features/auth/server/cookies'
import { getCampAuthState } from '@/features/auth/server/session'
import type { ApiErrorPayload } from '@/features/auth/types'

const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.weelume.com/api/v1'
const REQUEST_TIMEOUT_MS = 8000
const SUCCESS_CODE = 'COMMON.SUCCESS'

type UpstreamEnvelope<T> = {
  code?: unknown
  message?: unknown
  data?: T
}

export function membershipErrorResponse(error: unknown): NextResponse<ApiErrorPayload> {
  if (error instanceof WebsiteAuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }
  return NextResponse.json(
    { error: { code: 'membership_internal_error', message: '会员请求处理失败' } },
    { status: 500 },
  )
}

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

export function resolveMembershipApiBaseUrl(): string {
  const explicit = process.env.CAMP_API_BASE_URL?.trim()
  if (explicit) return trimTrailingSlashes(explicit)

  const internalOrigin = process.env.INTERNAL_API_URL?.trim()
  if (internalOrigin) return `${trimTrailingSlashes(internalOrigin)}/api/v1`

  return process.env.NODE_ENV === 'production'
    ? DEFAULT_PRODUCTION_API_BASE_URL
    : DEFAULT_DEV_API_BASE_URL
}

export async function getAccessTokenOrThrow(): Promise<string> {
  const state = await getCampAuthState()
  if (!state.authenticated) {
    throw new WebsiteAuthError('请先登录后再开通会员', { code: 'auth_required', status: 401 })
  }
  const snapshot = await readAuthCookies()
  if (!snapshot.accessToken) {
    throw new WebsiteAuthError('登录状态无效，请重新登录', { code: 'auth_required', status: 401 })
  }
  return snapshot.accessToken
}

export async function proxyMembershipRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse<T | ApiErrorPayload>> {
  try {
    const accessToken = await getAccessTokenOrThrow()
    const response = await fetch(`${resolveMembershipApiBaseUrl()}${path}`, {
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
            code: typeof envelope.code === 'string' ? envelope.code : 'membership_upstream_error',
            message: typeof envelope.message === 'string' ? envelope.message : '会员服务请求失败',
          },
        },
        { status: response.status },
      )
    }
    return NextResponse.json(envelope.data)
  } catch (error) {
    return membershipErrorResponse(error)
  }
}
