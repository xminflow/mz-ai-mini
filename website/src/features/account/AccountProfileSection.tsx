'use client'

import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { AccountAvatarEditor } from './AccountAvatarEditor'
import { useRouter } from 'next/navigation'

import type { ApiErrorPayload, AuthAccount } from '@/features/auth/types'

const DISPLAY_NAME_PATTERN = /^[^\p{C}]{1,64}$/u

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
  onClose: () => void
}

export function AccountProfileSection({ account, onClose }: AccountProfileSectionProps) {
  const router = useRouter()
  const formId = useId()
  const { locale } = useSiteLocale()
  const english = locale === 'en'
  const [currentAccount, setCurrentAccount] = useState<AuthAccount>(account)

  // 用户名修改状态
  const [usernameDraft, setUsernameDraft] = useState(account.display_name)
  const [usernameSubmitting, setUsernameSubmitting] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const usernameFormatValid = DISPLAY_NAME_PATTERN.test(usernameDraft.trim())
  const usernameChanged = usernameDraft.trim() !== currentAccount.display_name
  const canSubmitUsername = usernameFormatValid && usernameChanged && !usernameSubmitting

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUsernameError(null)
    setUsernameSubmitting(true)
    try {
      const response = await fetch('/api/auth/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: usernameDraft.trim() }),
      })
      if (!response.ok) {
        setUsernameError(await readErrorMessage(response))
        return
      }
      const payload = (await response.json()) as AccountSnapshotEnvelope
      setCurrentAccount(payload.account)
      setUsernameDraft(payload.account.display_name)
      window.dispatchEvent(new Event('weelume:profile-updated'))
      onClose()
      router.refresh()
    } catch {
      setUsernameError('请求失败，请稍后重试')
    } finally {
      setUsernameSubmitting(false)
    }
  }

  return <div className="account-profile-form">
    <AccountAvatarEditor account={currentAccount} onUpdated={setCurrentAccount} />
    <form id={formId} onSubmit={handleUsernameSubmit} className="account-profile-field">
      <label htmlFor={`${formId}-name`} className="account-profile-label">{english ? 'Display name' : '用户名'}</label>
      <input id={`${formId}-name`} type="text" autoComplete="nickname" value={usernameDraft}
        onChange={event => { setUsernameDraft(event.target.value); setUsernameError(null) }}
        maxLength={64} placeholder={english ? 'Your name' : '怎么称呼你？'} className="account-profile-input" />
      <p className="account-profile-hint">{english ? '1–64 characters. Make it yours.' : '1–64 个字符，支持中文，不必与别人不同。'}</p>
      {usernameError && <p role="alert" className="account-profile-feedback">{usernameError}</p>}
    </form>
    <div className="account-profile-actions">
      <Button variant="outline" onClick={onClose}>{english ? 'Done' : '完成'}</Button>
      <Button variant="primary" type="submit" form={formId} disabled={!canSubmitUsername}>
        {usernameSubmitting ? (english ? 'Saving…' : '保存中…') : (english ? 'Save changes' : '保存修改')}
      </Button>
    </div>
  </div>
}
