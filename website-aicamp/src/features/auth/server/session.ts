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
    error.code === 'CAMP_AUTH.REFRESH_TOKEN_EXPIRED' ||
    error.code === 'CAMP_AUTH.SESSION_REVOKED'
  )
}

// readonly：用于 Server Component 渲染上下文（layout/page）。Next 15.5 禁止在渲染期写 Cookie，
// 而 camp 的 refresh token 是一次性的：若在渲染期调用 refreshSession 轮换，新 token 无法落盘 →
// 旧 token 被后端作废 → 下次请求即掉线。故 readonly 模式严禁轮换，仅用现有 access 读账户；
// 需要续签时返回 reason='needs_refresh'，交由可写上下文处理（客户端自动续签 / SSR 自愈跳转）。
// 非 readonly（Route Handler）保持原有「过期即轮换并落盘」行为。
export async function getCampAuthState(
  options?: { readonly?: boolean },
): Promise<AuthState> {
  const readonly = options?.readonly === true
  const snapshot = await readAuthCookies()
  if (!snapshot.refreshToken) {
    return { authenticated: false, reason: 'missing_session' }
  }

  if (isExpired(snapshot.refreshTokenExpiresAt)) {
    if (!readonly) await clearAuthCookies()
    return { authenticated: false, reason: 'expired' }
  }

  const accessToken = snapshot.accessToken

  if (!accessToken || isExpired(snapshot.accessTokenExpiresAt)) {
    if (readonly) {
      return { authenticated: false, reason: 'needs_refresh' }
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
    // access 被后端拒绝（撤销/时钟偏移等）。readonly 不能轮换，交给可写上下文续签。
    if (readonly) {
      return { authenticated: false, reason: 'needs_refresh' }
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
