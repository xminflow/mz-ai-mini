// 会话 cookie 工具。必须 edge 安全（middleware 在 edge 运行），故用 btoa/atob 而非 Buffer。
export const SESSION_COOKIE_NAME = 'community_session'

export interface SessionUser {
  userId: string
  name: string
}

// 本期为 mock 会话：把用户信息 base64 编码进 cookie。
// TODO(接真鉴权)：换成 community-server 签发的不透明 token，由后端校验。
export function encodeSession(user: SessionUser): string {
  return btoa(encodeURIComponent(JSON.stringify(user)))
}

export function decodeSession(value: string | undefined | null): SessionUser | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(value))) as Partial<SessionUser>
    if (typeof parsed.userId === 'string' && typeof parsed.name === 'string') {
      return { userId: parsed.userId, name: parsed.name }
    }
    return null
  } catch {
    return null
  }
}
