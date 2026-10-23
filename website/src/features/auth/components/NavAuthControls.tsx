'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AccountAvatar } from '@/features/account/AccountAvatar'
import { usePathname } from 'next/navigation'
import { Button, buttonClassName } from '@/components/ui'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import type { AuthState, AuthAccount } from '../types'

type NavSession = { phase: 'loading' } | { phase: 'ready'; state: AuthState } | { phase: 'error' }

export function NavAuthControls({ onOpenProfile }: { onOpenProfile: (account: AuthAccount) => void }) {
  const pathname = usePathname()
  const { locale, copy } = useSiteLocale()
  const [session, setSession] = useState<NavSession>({ phase: 'loading' })
  const [requestKey, setRequestKey] = useState(0)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const requestRef = useRef<AbortController | null>(null)
  const menuRef = useRef<HTMLDetailsElement>(null)
  const english = locale === 'en'

  useEffect(() => {
    const controller = new AbortController()
    requestRef.current = controller
    void (async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error(`Auth check failed: ${response.status}`)
        const payload = await response.json() as { state?: AuthState }
        if (!payload.state || typeof payload.state.authenticated !== 'boolean') throw new Error('Invalid auth response')
        if (!controller.signal.aborted) setSession({ phase: 'ready', state: payload.state })
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('[nav-auth] session check failed', { errorType: error instanceof Error ? error.name : 'UnknownError' })
        setSession({ phase: 'error' })
      }
    })()
    return () => controller.abort()
  }, [pathname, requestKey])

  useEffect(() => {
    const update = () => setRequestKey(key => key + 1)
    window.addEventListener('weelume:profile-updated', update)
    return () => window.removeEventListener('weelume:profile-updated', update)
  }, [])

  useEffect(() => {
    if (session.phase !== 'ready' || !session.state.authenticated) return
    const url = new URL(window.location.href)
    if (url.searchParams.get('settings') !== 'profile') return
    url.searchParams.delete('settings')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    onOpenProfile(session.state.account)
  }, [session, onOpenProfile])

  async function logout() {
    if (loggingOut) return
    // 取消仍在途的查询，避免退出后旧响应重新显示已登录。
    requestRef.current?.abort()
    setLoggingOut(true)
    setLogoutError('')
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error(`Logout failed: ${response.status}`)
      setSession({ phase: 'ready', state: { authenticated: false, reason: 'missing_session' } })
    } catch (error) {
      console.error('[nav-auth] logout failed', { errorType: error instanceof Error ? error.name : 'UnknownError' })
      setLogoutError(english ? 'Sign-out failed. Please retry.' : '退出请求失败，请重试。')
      // 注销接口失败时也可能已清除本地 Cookie，重新查询真实状态，不猜测结果。
      setRequestKey(key => key + 1)
    } finally {
      setLoggingOut(false)
    }
  }

  if (session.phase === 'loading') return <Button variant="outline" disabled aria-label={english ? 'Checking sign-in status' : '正在确认登录状态'}>…</Button>
  if (session.phase === 'error') return <Button variant="outline" onClick={() => setRequestKey(key => key + 1)} title={english ? 'Could not check sign-in status. Click to retry.' : '登录状态检查失败，点击重试。'}>{english ? 'Retry' : '重试'}</Button>
  if (!session.state.authenticated) {
    const next = pathname.startsWith('/login') ? (english ? '/en' : '/') : pathname
    return <div className="relative">
      <Link href={`/login?next=${encodeURIComponent(next)}`} data-button-variant="outline" className={buttonClassName('outline')}>{copy.navLogin}</Link>
      {logoutError && <p role="alert" className="nav-account-error">{logoutError}</p>}
    </div>
  }

  const account = session.state.account
  const label = account.display_name || 'weelume'
  return <details ref={menuRef} className="nav-account relative">
    <summary data-button-variant="outline" className={buttonClassName('outline')} title={label} aria-label={`${english ? 'Signed in as' : '已登录：'} ${label}`}>
      <AccountAvatar avatarUrl={account.avatar_url} />
      <span className="nav-account-label">{label}</span><span aria-hidden="true">⌄</span>
    </summary>
    <div className="nav-account-panel absolute right-0 top-full z-40 mt-2 min-w-44 rounded-card border border-rule bg-paper-raised p-4 shadow-soft">
      <p className="break-all text-sm text-graphite">{label}</p>
      <button type="button" aria-haspopup="dialog" className="mt-3 block w-full rounded-btn border border-rule px-3 py-2 text-left text-sm text-graphite transition-colors hover:bg-graphite/[0.04]" onClick={() => {
        if (menuRef.current) {
          menuRef.current.open = false
          menuRef.current.querySelector('summary')?.focus()
        }
        onOpenProfile(account)
      }}>{english ? 'Personal information' : '个人信息'}</button>
      {account.email && <p className="mt-1 break-all text-xs text-graphite-soft">{account.email}</p>}
      <Button variant="outline" className="mt-3 w-full disabled:opacity-50" onClick={logout} disabled={loggingOut}>{loggingOut ? (english ? 'Signing out…' : '退出中…') : (english ? 'Sign out' : '退出登录')}</Button>
      {logoutError && <p role="alert" className="mt-2 text-xs text-red-700">{logoutError}</p>}
    </div>
  </details>
}
