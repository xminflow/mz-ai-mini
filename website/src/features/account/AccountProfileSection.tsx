'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import type { ApiErrorPayload, AuthAccount, EmailBindingChallenge } from '@/features/auth/types'

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/

type ChallengeResponse = {
  login_challenge_id: string
  expires_at: string
  cooldown_seconds: number
}

type AccountSnapshotEnvelope = {
  account: AuthAccount
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'error' in value &&
    typeof (value as ApiErrorPayload).error?.message === 'string'
  )
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown
    if (isApiErrorPayload(payload)) return payload.error.message
  } catch {
    return '请求失败，请稍后重试'
  }
  return '请求失败，请稍后重试'
}

type AccountProfileSectionProps = {
  account: AuthAccount
}

export function AccountProfileSection({ account }: AccountProfileSectionProps) {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState<AuthAccount>(account)

  // 用户名修改状态
  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState(account.username)
  const [usernameSubmitting, setUsernameSubmitting] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null)

  // 邮箱绑定状态
  const [emailDraft, setEmailDraft] = useState('')
  const [challenge, setChallenge] = useState<EmailBindingChallenge | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [sendingCode, setSendingCode] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailMessage, setEmailMessage] = useState<string | null>(null)

  const usernameFormatValid = USERNAME_PATTERN.test(usernameDraft.trim().toLowerCase())
  const usernameChanged = usernameDraft.trim().toLowerCase() !== currentAccount.username
  const canSubmitUsername = usernameFormatValid && usernameChanged && !usernameSubmitting

  const canSendCode = emailDraft.trim().length > 3 && !sendingCode
  const canVerify =
    Boolean(challenge?.login_challenge_id) && verificationCode.trim().length === 6 && !verifyingCode

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUsernameError(null)
    setUsernameMessage(null)
    setUsernameSubmitting(true)
    try {
      const response = await fetch('/api/auth/me/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_username: usernameDraft.trim().toLowerCase() }),
      })
      if (!response.ok) {
        setUsernameError(await readErrorMessage(response))
        return
      }
      const payload = (await response.json()) as AccountSnapshotEnvelope
      setCurrentAccount(payload.account)
      setUsernameDraft(payload.account.username)
      setEditingUsername(false)
      setUsernameMessage('用户名已更新')
      router.refresh()
    } catch {
      setUsernameError('请求失败，请稍后重试')
    } finally {
      setUsernameSubmitting(false)
    }
  }

  const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEmailError(null)
    setEmailMessage(null)
    setSendingCode(true)
    try {
      const response = await fetch('/api/auth/me/email-binding/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailDraft.trim() }),
      })
      if (!response.ok) {
        setEmailError(await readErrorMessage(response))
        return
      }
      const payload = (await response.json()) as ChallengeResponse
      setChallenge(payload)
      setEmailMessage(
        `验证码已发送至 ${emailDraft.trim()}，有效期至 ${new Date(payload.expires_at).toLocaleTimeString()}`,
      )
    } catch {
      setEmailError('请求失败，请稍后重试')
    } finally {
      setSendingCode(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!challenge) return
    setEmailError(null)
    setEmailMessage(null)
    setVerifyingCode(true)
    try {
      const response = await fetch(
        `/api/auth/me/email-binding/challenges/${encodeURIComponent(challenge.login_challenge_id)}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verification_code: verificationCode.trim() }),
        },
      )
      if (!response.ok) {
        setEmailError(await readErrorMessage(response))
        return
      }
      const payload = (await response.json()) as AccountSnapshotEnvelope
      setCurrentAccount(payload.account)
      setChallenge(null)
      setVerificationCode('')
      setEmailDraft('')
      setEmailMessage(`邮箱已绑定：${payload.account.email}`)
      router.refresh()
    } catch {
      setEmailError('请求失败，请稍后重试')
    } finally {
      setVerifyingCode(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase text-accent-2">Account Profile</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          个人信息
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          修改用户名或绑定邮箱用于账号找回与通知。
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-[8px] border border-hairline bg-surface/80 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-muted">用户名</p>
            {!editingUsername && (
              <button
                type="button"
                onClick={() => {
                  setEditingUsername(true)
                  setUsernameError(null)
                  setUsernameMessage(null)
                  setUsernameDraft(currentAccount.username)
                }}
                className="text-sm text-accent-2 transition-colors hover:text-ink"
              >
                修改
              </button>
            )}
          </div>

          {!editingUsername ? (
            <p className="mt-3 text-xl font-medium text-ink">{currentAccount.username}</p>
          ) : (
            <form onSubmit={handleUsernameSubmit} className="mt-3 space-y-3">
              <input
                type="text"
                value={usernameDraft}
                onChange={(event) => setUsernameDraft(event.target.value)}
                autoComplete="off"
                placeholder="3-32 个字符：a-z / 0-9 / _"
                className="h-11 w-full rounded-[6px] border border-hairline bg-canvas px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
              <p className="text-xs text-muted">
                只允许小写字母、数字、下划线，长度 3-32 个字符。
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={!canSubmitUsername}
                  className="inline-flex h-10 items-center justify-center rounded-[6px] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {usernameSubmitting ? '保存中…' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUsername(false)
                    setUsernameDraft(currentAccount.username)
                    setUsernameError(null)
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-[6px] border border-hairline px-4 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  取消
                </button>
              </div>
            </form>
          )}
          {usernameMessage && (
            <p className="mt-3 rounded-[6px] border border-accent-2/20 bg-accent-2/10 px-3 py-2 text-sm text-ink-soft">
              {usernameMessage}
            </p>
          )}
          {usernameError && (
            <p className="mt-3 rounded-[6px] border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {usernameError}
            </p>
          )}
        </div>

        <div className="rounded-[8px] border border-hairline bg-surface/80 p-6">
          <p className="text-sm text-muted">邮箱</p>
          <p className="mt-3 text-xl font-medium text-ink">
            {currentAccount.email ?? '未绑定'}
          </p>

          <form onSubmit={handleSendCode} className="mt-5 space-y-3 border-t border-hairline pt-5">
            <label className="block">
              <span className="text-sm font-medium text-ink-soft">
                {currentAccount.email ? '更换邮箱' : '绑定邮箱'}
              </span>
              <input
                type="email"
                value={emailDraft}
                onChange={(event) => setEmailDraft(event.target.value)}
                autoComplete="email"
                placeholder="name@example.com"
                className="mt-2 h-11 w-full rounded-[6px] border border-hairline bg-canvas px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
            </label>
            <button
              type="submit"
              disabled={!canSendCode}
              className="inline-flex h-10 w-full items-center justify-center rounded-[6px] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {sendingCode ? '发送中…' : challenge ? '重新发送验证码' : '发送验证码'}
            </button>
          </form>

          {challenge && (
            <form onSubmit={handleVerifyCode} className="mt-3 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-ink-soft">验证码</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  autoComplete="one-time-code"
                  placeholder="输入收到的 6 位验证码"
                  className="mt-2 h-11 w-full rounded-[6px] border border-hairline bg-canvas px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
                />
              </label>
              <button
                type="submit"
                disabled={!canVerify}
                className="inline-flex h-10 w-full items-center justify-center rounded-[6px] border border-hairline-strong bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {verifyingCode ? '校验中…' : '确认绑定'}
              </button>
            </form>
          )}
          {emailMessage && (
            <p className="mt-3 rounded-[6px] border border-accent-2/20 bg-accent-2/10 px-3 py-2 text-sm text-ink-soft">
              {emailMessage}
            </p>
          )}
          {emailError && (
            <p className="mt-3 rounded-[6px] border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {emailError}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
