'use client'

import { FormEvent, useState } from 'react'

import type { ApiErrorPayload, AuthState, EmailLoginChallenge } from '@/features/auth/types'

type ChallengeResponse = {
  challenge: EmailLoginChallenge
}

type VerifyResponse = {
  state: AuthState
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'error' in value &&
    typeof (value as ApiErrorPayload).error?.message === 'string'
  )
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown
    if (isApiErrorPayload(payload)) return payload.error.message
  } catch {
    return '请求失败，请稍后重试'
  }
  return '请求失败，请稍后重试'
}

type EmailLoginPanelProps = {
  onSuccess: (state: AuthState) => void
}

export function EmailLoginPanel({ onSuccess }: EmailLoginPanelProps) {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [challenge, setChallenge] = useState<EmailLoginChallenge | null>(null)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canSubmitEmail = email.trim().length > 3 && !sending
  const canVerify =
    Boolean(challenge?.login_challenge_id) && verificationCode.trim().length >= 4 && !verifying

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSending(true)

    try {
      const response = await fetch('/api/auth/email-login/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        setError(await parseApiError(response))
        return
      }

      const payload = (await response.json()) as ChallengeResponse
      setChallenge(payload.challenge)
      setMessage(
        `验证码已发送，有效期至 ${new Date(payload.challenge.expires_at).toLocaleTimeString()}`,
      )
    } catch {
      setError('认证服务暂时不可用，请稍后重试')
    } finally {
      setSending(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!challenge) return

    setError(null)
    setMessage(null)
    setVerifying(true)

    try {
      const response = await fetch(
        `/api/auth/email-login/challenges/${encodeURIComponent(challenge.login_challenge_id)}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verification_code: verificationCode.trim() }),
        },
      )

      if (!response.ok) {
        setError(await parseApiError(response))
        return
      }

      const payload = (await response.json()) as VerifyResponse
      if (payload.state.authenticated) {
        onSuccess(payload.state)
        return
      }
      setError('登录状态未生效，请重新获取验证码')
    } catch {
      setError('认证服务暂时不可用，请稍后重试')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleRequestCode} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">邮箱</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="name@example.com"
            className="mt-2 h-11 w-full rounded-[6px] border border-hairline bg-canvas px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={!canSubmitEmail}
          className="inline-flex h-11 w-full items-center justify-center rounded-[6px] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {sending ? '发送中...' : challenge ? '重新发送验证码' : '发送验证码'}
        </button>
      </form>

      <form onSubmit={handleVerifyCode} className="space-y-4 border-t border-hairline pt-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-soft">验证码</span>
          <input
            type="text"
            inputMode="numeric"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            autoComplete="one-time-code"
            placeholder="输入邮箱验证码"
            className="mt-2 h-11 w-full rounded-[6px] border border-hairline bg-canvas px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={!canVerify}
          className="inline-flex h-11 w-full items-center justify-center rounded-[6px] border border-hairline-strong bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {verifying ? '登录中...' : '登录'}
        </button>
      </form>

      {message && (
        <p className="rounded-[6px] border border-accent-2/20 bg-accent-2/10 px-3 py-2 text-sm text-ink-soft">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-[6px] border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      )}
    </div>
  )
}
