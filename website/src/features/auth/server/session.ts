import type { AuthState } from '../types'
import { getCurrentAccount, refreshSession, WebsiteAuthError } from './backend'
import {
  clearAuthCookies,
  isExpired,
  readAuthCookies,
  toAuthenticatedState,
  writeAuthCookies,
} from './cookies'

// 只有明确的凭证失效才应清除 cookie；网络错误、后端重启等暂时性故障不应销毁会话
function isSessionRevocationError(error: unknown): boolean {
  if (!(error instanceof WebsiteAuthError)) return false
  return (
    error.code === 'AGENT_AUTH.REFRESH_TOKEN_EXPIRED' ||
    error.code === 'AGENT_AUTH.SESSION_REVOKED'
  )
}

export async function getWebsiteAuthState(): Promise<AuthState> {
  const snapshot = await readAuthCookies()
  if (!snapshot.refreshToken) {
    return { authenticated: false, reason: 'missing_session' }
  }

  if (isExpired(snapshot.refreshTokenExpiresAt)) {
    await clearAuthCookies()
    return { authenticated: false, reason: 'expired' }
  }

  let accessToken = snapshot.accessToken

  if (!accessToken || isExpired(snapshot.accessTokenExpiresAt)) {
    try {
      const refreshed = await refreshSession(snapshot.refreshToken)
      await writeAuthCookies(refreshed)
      accessToken = refreshed.tokens.access_token
      return toAuthenticatedState(refreshed)
    } catch (error) {
      if (isSessionRevocationError(error)) {
        await clearAuthCookies()
        return { authenticated: false, reason: 'revoked' }
      }
      // 暂时性错误（后端重启、网络中断等）：保留 cookie，不销毁会话
      return { authenticated: false, reason: 'missing_session' }
    }
  }

  try {
    const account = await getCurrentAccount(accessToken)
    return {
      authenticated: true,
      account,
      access_token_expires_at: snapshot.accessTokenExpiresAt ?? '',
      refresh_token_expires_at: snapshot.refreshTokenExpiresAt ?? '',
    }
  } catch (error) {
    if (!(error instanceof WebsiteAuthError) || !snapshot.refreshToken) {
      throw error
    }
  }

  try {
    const refreshed = await refreshSession(snapshot.refreshToken)
    await writeAuthCookies(refreshed)
    return toAuthenticatedState(refreshed)
  } catch (error) {
    if (isSessionRevocationError(error)) {
      await clearAuthCookies()
      return { authenticated: false, reason: 'revoked' }
    }
    // 暂时性错误：保留 cookie，不销毁会话
    return { authenticated: false, reason: 'missing_session' }
  }
}
