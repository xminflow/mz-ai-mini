import { cookies } from 'next/headers'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

import {
  ACCESS_EXPIRES_COOKIE,
  ACCESS_TOKEN_COOKIE,
  REFRESH_EXPIRES_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../cookie-names'
import type { AuthPayload, AuthState } from '../types'

export type AuthCookieSnapshot = {
  accessToken: string | null
  refreshToken: string | null
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function cookieOptions(expiresAt: string): Partial<ResponseCookie> {
  const expires = new Date(expiresAt)
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(),
    path: '/',
    expires: Number.isNaN(expires.getTime()) ? undefined : expires,
  }
}

function metadataCookieOptions(expiresAt: string): Partial<ResponseCookie> {
  return {
    ...cookieOptions(expiresAt),
    httpOnly: false,
  }
}

export async function readAuthCookies(): Promise<AuthCookieSnapshot> {
  const cookieStore = await cookies()
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null,
    accessTokenExpiresAt: cookieStore.get(ACCESS_EXPIRES_COOKIE)?.value ?? null,
    refreshTokenExpiresAt: cookieStore.get(REFRESH_EXPIRES_COOKIE)?.value ?? null,
  }
}

// Next.js 15.5+ 在 Server Component 渲染期间禁止改 cookie；只有 Server Action / Route Handler 可以。
// getWebsiteAuthState 同时被 layout(Server Component) 和 /api/auth/* (Route Handler) 复用，
// 因此 write/clear 在 layout 路径上需要显式跳过，避免抛错把整个页面打挂。
// 跳过不是静默兜底：会发出 console.warn，调用方拿到 false 也能据此推断写入是否生效。
function isReadonlyCookieContextError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return /Cookies can only be modified in a Server Action or Route Handler/i.test(
    error.message,
  )
}

export async function writeAuthCookies(payload: AuthPayload): Promise<boolean> {
  const cookieStore = await cookies()
  try {
    cookieStore.set(
      ACCESS_TOKEN_COOKIE,
      payload.tokens.access_token,
      cookieOptions(payload.tokens.access_token_expires_at),
    )
    cookieStore.set(
      REFRESH_TOKEN_COOKIE,
      payload.tokens.refresh_token,
      cookieOptions(payload.tokens.refresh_token_expires_at),
    )
    cookieStore.set(
      ACCESS_EXPIRES_COOKIE,
      payload.tokens.access_token_expires_at,
      metadataCookieOptions(payload.tokens.access_token_expires_at),
    )
    cookieStore.set(
      REFRESH_EXPIRES_COOKIE,
      payload.tokens.refresh_token_expires_at,
      metadataCookieOptions(payload.tokens.refresh_token_expires_at),
    )
    return true
  } catch (error) {
    if (isReadonlyCookieContextError(error)) {
      console.warn(
        '[auth] writeAuthCookies skipped: called from a read-only render context; cookie write deferred until next route handler / server action',
      )
      return false
    }
    throw error
  }
}

export async function clearAuthCookies(): Promise<boolean> {
  const cookieStore = await cookies()
  try {
    cookieStore.delete(ACCESS_TOKEN_COOKIE)
    cookieStore.delete(REFRESH_TOKEN_COOKIE)
    cookieStore.delete(ACCESS_EXPIRES_COOKIE)
    cookieStore.delete(REFRESH_EXPIRES_COOKIE)
    return true
  } catch (error) {
    if (isReadonlyCookieContextError(error)) {
      console.warn(
        '[auth] clearAuthCookies skipped: called from a read-only render context; cookie cleanup deferred until next route handler / server action',
      )
      return false
    }
    throw error
  }
}

export function isExpired(value: string | null): boolean {
  if (!value) return true
  const time = new Date(value).getTime()
  return Number.isNaN(time) || time <= Date.now()
}

export function toAuthenticatedState(payload: AuthPayload): AuthState {
  return {
    authenticated: true,
    account: payload.account,
    access_token_expires_at: payload.tokens.access_token_expires_at,
    refresh_token_expires_at: payload.tokens.refresh_token_expires_at,
  }
}
