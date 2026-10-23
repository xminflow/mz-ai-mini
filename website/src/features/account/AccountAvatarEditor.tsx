'use client'

import { useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthAccount, ApiErrorPayload } from '@/features/auth/types'
import { AccountAvatar } from './AccountAvatar'
import { buttonClassName } from '@/components/ui'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result.split(',')[1]) : reject(new Error('无法读取头像文件'))
    reader.onerror = () => reject(new Error('无法读取头像文件'))
    reader.readAsDataURL(file)
  })
}

export function AccountAvatarEditor({ account, onUpdated }: { account: AuthAccount; onUpdated: (account: AuthAccount) => void }) {
  const router = useRouter()
  const { locale } = useSiteLocale()
  const english = locale === 'en'
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploading) return
    setError('')
    setMessage('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('请选择不超过 2 MB 的 JPG、PNG 或 WebP 图片。')
      return
    }
    setUploading(true)
    try {
      const response = await fetch('/api/auth/me/avatar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: file.type, content_base64: await readImage(file) }),
      })
      const payload = await response.json() as { account?: AuthAccount } & Partial<ApiErrorPayload>
      if (!response.ok || !payload.account) throw new Error(payload.error?.message || '头像上传失败，请重试。')
      onUpdated(payload.account)
      setMessage('头像已更新')
      window.dispatchEvent(new Event('weelume:profile-updated'))
      router.refresh()
    } catch (cause) {
      console.error('[account-avatar] upload failed', { errorType: cause instanceof Error ? cause.name : 'UnknownError' })
      setError(cause instanceof Error ? cause.message : '头像上传失败，请重试。')
    } finally {
      setUploading(false)
    }
  }

  return <div>
    <div className="account-profile-avatar">
      <AccountAvatar avatarUrl={account.avatar_url} size="large" />
      <div>
        <label data-button-variant="outline" className={buttonClassName('outline', `relative cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 ${uploading ? 'opacity-50' : ''}`)}>
          {uploading ? (english ? 'Uploading…' : '上传中…') : (english ? 'Change photo' : '更换头像')}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={english ? 'Change photo' : '更换头像'} disabled={uploading} onChange={upload} />
        </label>
        <p className="account-profile-hint">JPG / PNG / WebP · {english ? 'Up to 2 MB' : '不超过 2 MB'}</p>
      </div>
    </div>
    {error && <p role="alert" className="account-profile-feedback">{error}</p>}
    {message && <p role="status" className="account-profile-feedback">{message}</p>}
  </div>
}
