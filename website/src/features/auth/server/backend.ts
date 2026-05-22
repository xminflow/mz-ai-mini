import type { AuthAccount, AuthPayload, WechatLoginSession, WechatLoginSessionStatus } from '../types'

const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.weelume.com/api/v1'
const REQUEST_TIMEOUT_MS = 15000
const SUCCESS_CODE = 'COMMON.SUCCESS'

type UpstreamEnvelope<T> = {
  code?: unknown
  message?: unknown
  data?: T
}

type UpstreamAuthAccount = {
  account_id?: unknown
  username?: unknown
  email?: unknown
  status?: unknown
  created_at?: unknown
}

type UpstreamAuthTokens = {
  access_token?: unknown
  access_token_expires_at?: unknown
  refresh_token?: unknown
  refresh_token_expires_at?: unknown
}

type UpstreamAuthPayload = {
  account?: unknown
  tokens?: unknown
}

export class WebsiteAuthError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, options: { code?: string; status?: number } = {}) {
    super(message)
    this.name = 'WebsiteAuthError'
    this.code = options.code ?? 'AUTH.UPSTREAM_ERROR'
    this.status = options.status ?? 502
  }
}

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

function resolveApiBaseUrl(): string {
  const explicit = process.env.WEBSITE_API_BASE_URL?.trim()
  if (explicit) return trimTrailingSlashes(explicit)

  const internalOrigin = process.env.INTERNAL_API_URL?.trim()
  if (internalOrigin) return `${trimTrailingSlashes(internalOrigin)}/api/v1`

  return process.env.NODE_ENV === 'production'
    ? DEFAULT_PRODUCTION_API_BASE_URL
    : DEFAULT_DEV_API_BASE_URL
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeAccount(raw: UpstreamAuthAccount): AuthAccount {
  return {
    account_id: asString(raw.account_id),
    username: asString(raw.username),
    email: asString(raw.email) || null,
    status: raw.status === 'disabled' ? 'disabled' : 'active',
    created_at: asString(raw.created_at),
  }
}

function normalizeAuthPayload(raw: UpstreamAuthPayload): AuthPayload {
  const accountRaw =
    raw.account && typeof raw.account === 'object' ? (raw.account as UpstreamAuthAccount) : {}
  const tokensRaw =
    raw.tokens && typeof raw.tokens === 'object' ? (raw.tokens as UpstreamAuthTokens) : {}

  return {
    account: normalizeAccount(accountRaw),
    tokens: {
      access_token: asString(tokensRaw.access_token),
      access_token_expires_at: asString(tokensRaw.access_token_expires_at),
      refresh_token: asString(tokensRaw.refresh_token),
      refresh_token_expires_at: asString(tokensRaw.refresh_token_expires_at),
    },
  }
}

async function requestUpstream<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${resolveApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '认证服务暂时不可用'
    throw new WebsiteAuthError(message, { code: 'AUTH.NETWORK_ERROR', status: 502 })
  }

  let envelope: UpstreamEnvelope<T>
  try {
    envelope = (await response.json()) as UpstreamEnvelope<T>
  } catch {
    throw new WebsiteAuthError('认证服务返回了无法解析的数据', {
      code: 'AUTH.INVALID_RESPONSE',
      status: 502,
    })
  }

  if (!response.ok || envelope.code !== SUCCESS_CODE || envelope.data === undefined) {
    const message = typeof envelope.message === 'string' ? envelope.message : '认证请求失败'
    throw new WebsiteAuthError(message, {
      code: typeof envelope.code === 'string' ? envelope.code : 'AUTH.UPSTREAM_ERROR',
      status: response.status,
    })
  }

  return envelope.data
}

export async function refreshSession(refreshToken: string): Promise<AuthPayload> {
  const payload = await requestUpstream<UpstreamAuthPayload>('/agent-auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  return normalizeAuthPayload(payload)
}

export async function logoutSession(refreshToken: string): Promise<void> {
  await requestUpstream('/agent-auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function getCurrentAccount(accessToken: string): Promise<AuthAccount> {
  const payload = await requestUpstream<UpstreamAuthAccount>('/agent-auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return normalizeAccount(payload)
}

type UpstreamWechatLoginSession = {
  login_session_id?: unknown
  qr_code_url?: unknown
  expires_at?: unknown
  poll_interval_ms?: unknown
}

type UpstreamWechatLoginSessionStatus = {
  login_session_id?: unknown
  status?: unknown
  expires_at?: unknown
}

export async function createWechatLoginSession(): Promise<WechatLoginSession> {
  const payload = await requestUpstream<UpstreamWechatLoginSession>(
    '/agent-auth/wechat-official/login-sessions',
    { method: 'POST', body: JSON.stringify({}) },
  )
  return {
    login_session_id: asString(payload.login_session_id),
    qr_code_url: asString(payload.qr_code_url),
    expires_at: asString(payload.expires_at),
    poll_interval_ms:
      typeof payload.poll_interval_ms === 'number' && Number.isFinite(payload.poll_interval_ms)
        ? payload.poll_interval_ms
        : 2000,
  }
}

export async function getWechatLoginSession(loginSessionId: string): Promise<WechatLoginSessionStatus> {
  const payload = await requestUpstream<UpstreamWechatLoginSessionStatus>(
    `/agent-auth/wechat-official/login-sessions/${loginSessionId}`,
    { method: 'GET' },
  )
  const raw = asString(payload.status)
  const status: WechatLoginSessionStatus['status'] =
    raw === 'authenticated' || raw === 'consumed' || raw === 'expired' ? raw : 'pending'
  return {
    login_session_id: asString(payload.login_session_id),
    status,
    expires_at: asString(payload.expires_at),
  }
}

export async function exchangeWechatLogin(loginSessionId: string): Promise<AuthPayload> {
  const payload = await requestUpstream<UpstreamAuthPayload>(
    `/agent-auth/wechat-official/login-sessions/${loginSessionId}/exchange`,
    { method: 'POST', body: JSON.stringify({}) },
  )
  return normalizeAuthPayload(payload)
}

// dev-only：直连后端 POST /agent-auth/dev/fake-login 拿 token；后端 env=production 时会 404。
export async function devFakeLogin(username?: string): Promise<AuthPayload> {
  const body = username && username.trim() !== '' ? { username: username.trim() } : {}
  const payload = await requestUpstream<UpstreamAuthPayload>('/agent-auth/dev/fake-login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return normalizeAuthPayload(payload)
}
