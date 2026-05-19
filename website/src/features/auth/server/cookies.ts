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

export async function writeAuthCookies(payload: AuthPayload): Promise<void> {
  const cookieStore = await cookies()
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
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
  cookieStore.delete(ACCESS_EXPIRES_COOKIE)
  cookieStore.delete(REFRESH_EXPIRES_COOKIE)
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
