'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AuthState } from '@/features/auth/types'
import { AccountMenu } from './AccountMenu'
import { ContactQrCodeModal } from './ContactQrCodeModal'

// 独立训练营站点的精简顶栏:左侧品牌 + 右侧「登录/账户」与「咨询」入口。
export const TopNav = ({ initialAuthState }: { initialAuthState: AuthState }) => {
  const [scrolled, setScrolled] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [authState, setAuthState] = useState(initialAuthState)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()

  useEffect(() => setAuthState(initialAuthState), [initialAuthState])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loginNextPath = pathname?.startsWith('/login') ? '/' : (pathname || '/')
  const loginHref = `/login?next=${encodeURIComponent(loginNextPath)}`

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setAuthState({ authenticated: false, reason: 'missing_session' })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 w-full"
    >
      <div
        className={[
          'transition-all duration-300',
          scrolled
            ? 'border-b border-hairline bg-canvas/75 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <img src="/logo/weiyu-logo-web-light.svg" alt="微域生光" className="h-9 w-9 sm:h-10 sm:w-10" />
            <span className="text-[15px] font-semibold tracking-tight text-ink transition-opacity group-hover:opacity-80 sm:text-base">
              微域生光
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/course"
              className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-[14px] font-medium text-ink transition-all hover:border-hairline-strong sm:text-[15px]"
            >
              课程
            </Link>
            {authState.authenticated ? (
              <AccountMenu authState={authState} loggingOut={loggingOut} onLogout={handleLogout} />
            ) : (
              <Link
                href={loginHref}
                className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-[14px] font-medium text-ink transition-all hover:border-hairline-strong sm:text-[15px]"
              >
                登录
              </Link>
            )}
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="group relative overflow-hidden rounded-full border border-hairline bg-surface px-4 py-1.5 text-[14px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:border-hairline-strong hover:shadow-[0_6px_20px_rgba(167,139,250,0.2)] sm:text-[15px]"
            >
              咨询
            </button>
          </div>
        </div>
      </div>
      <ContactQrCodeModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </motion.header>
  )
}
