'use client'

import { useEffect, useId, useRef } from 'react'
import type { AuthAccount } from '@/features/auth/types'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { AccountProfileSection } from './AccountProfileSection'
import './account-profile.css'

export function AccountProfileModal({ account, onClose }: { account: AuthAccount; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  const descriptionId = useId()
  const { locale, copy } = useSiteLocale()
  const english = locale === 'en'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    // 原生 dialog 进入顶层并保留 DOM 继承关系，自动沿用当前主站/模板市场的主题令牌。
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      trigger?.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={dialogRef} className="account-profile-modal" aria-labelledby={headingId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose()
    }}>
    <header className="account-profile-heading">
      <div>
        <h2 id={headingId}>{english ? 'Personal information' : '个人信息'}</h2>
        <p id={descriptionId}>{english ? 'Make yourself at home.' : '换个头像，认识一下新的你。'}</p>
      </div>
      <button type="button" className="account-profile-close" onClick={onClose} aria-label={copy.close}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </header>
    <AccountProfileSection account={account} onClose={onClose} />
  </dialog>
}
