export type AuthAccount = {
  account_id: string
  username: string
  email: string | null
  status: 'active' | 'disabled'
  created_at: string
}

export type AuthTokenSet = {
  access_token: string
  access_token_expires_at: string
  refresh_token: string
  refresh_token_expires_at: string
}

export type AuthPayload = {
  account: AuthAccount
  tokens: AuthTokenSet
}

export type AuthState =
  | {
      authenticated: true
      account: AuthAccount
      access_token_expires_at: string
      refresh_token_expires_at: string
    }
  | {
      authenticated: false
      reason: 'missing_session' | 'expired' | 'revoked'
    }

export type ApiErrorPayload = {
  error: {
    code: string
    message: string
  }
}

export type WechatLoginSession = {
  login_session_id: string
  qr_code_url: string
  expires_at: string
  poll_interval_ms: number
}

export type WechatLoginSessionStatus = {
  login_session_id: string
  status: 'pending' | 'authenticated' | 'consumed' | 'expired'
  expires_at: string
}
