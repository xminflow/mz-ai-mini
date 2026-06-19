'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AuthState } from '@/features/auth/types'
import { ContactQrCodeModal } from './ContactQrCodeModal'
import { AccountMenu } from './AccountMenu'

type NavLink = {
  href: string
  label: string
  exact?: boolean
  matchPrefix?: string
  dropdown?: Array<{
    label: string
    href: string
    desc?: string
    soon?: boolean
  }>
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'AI架构师训练营', exact: true },
  { href: '/course', label: '课程', matchPrefix: '/course' },
  { href: '/product', label: '产品', matchPrefix: '/product' },
]

type TopNavProps = {
  initialAuthState: AuthState
}

export const TopNav = ({ initialAuthState }: TopNavProps) => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  // 追踪本地登出覆盖：记录覆盖时对应的 prop 引用，当服务端刷新传入新 prop 时自动放弃覆盖。
  const [authOverride, setAuthOverride] = useState<{ forProp: AuthState; value: AuthState } | null>(null)
  const authState = authOverride?.forProp === initialAuthState ? authOverride.value : initialAuthState
  const [loggingOut, setLoggingOut] = useState(false)
  const closeTimer = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (link: NavLink) => {
    if (link.exact) return pathname === link.href
    if (link.matchPrefix) return pathname.startsWith(link.matchPrefix)
    return pathname.startsWith(link.href)
  }

  const scheduleClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpenDropdown(null), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const loginNextPath = pathname.startsWith('/login') ? '/' : pathname || '/'
  const loginHref = `/login?next=${encodeURIComponent(loginNextPath)}`
  const accountLabel =
    authState.authenticated
      ? authState.account.email || authState.account.username || '已登录'
      : null

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setAuthOverride({ forProp: initialAuthState, value: { authenticated: false, reason: 'missing_session' } })
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

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link)
              const hasDropdown = Boolean(link.dropdown?.length)
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => {
                    if (!hasDropdown) return
                    cancelClose()
                    setOpenDropdown(link.label)
                  }}
                  onMouseLeave={() => {
                    if (!hasDropdown) return
                    scheduleClose()
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpenDropdown(null)}
                    className={[
                      'relative inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[14px] transition-colors sm:text-[15px]',
                      active ? 'text-ink' : 'text-muted hover:text-ink',
                    ].join(' ')}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-surface/70 backdrop-blur"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span>{link.label}</span>
                    {hasDropdown && (
                      <svg
                        viewBox="0 0 12 12"
                        className={[
                          'h-2.5 w-2.5 transition-transform',
                          openDropdown === link.label ? 'rotate-180 text-ink' : '',
                        ].join(' ')}
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M2.5 4.25a.6.6 0 01.85 0L6 6.9l2.65-2.65a.6.6 0 11.85.85l-3.08 3.08a.6.6 0 01-.85 0L2.5 5.1a.6.6 0 010-.85z" />
                      </svg>
                    )}
                  </Link>

                  <AnimatePresence>
                    {hasDropdown && openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-1/2 top-full z-40 mt-2 w-[300px] -translate-x-1/2 overflow-hidden rounded-2xl border border-hairline bg-surface/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                      >
                        {link.dropdown!.map((item) => {
                          const itemClass =
                            'group flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors'
                          if (item.soon) {
                            return (
                              <div
                                key={item.label}
                                className={`${itemClass} cursor-not-allowed opacity-60`}
                              >
                                <span className="flex items-center gap-2 text-[13.5px] font-medium text-ink-soft">
                                  {item.label}
                                  <span className="rounded-full border border-hairline px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                                    Soon
                                  </span>
                                </span>
                                {item.desc && (
                                  <span className="text-[11.5px] text-muted">{item.desc}</span>
                                )}
                              </div>
                            )
                          }
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`${itemClass} hover:bg-canvas/60`}
                            >
                              <span className="text-[13.5px] font-medium text-ink">{item.label}</span>
                              {item.desc && (
                                <span className="text-[11.5px] text-muted">{item.desc}</span>
                              )}
                            </Link>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {accountLabel ? (
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

          <nav className="flex items-center gap-3 md:hidden">
            {NAV_LINKS.map((link) => {
              const active = isActive(link)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'text-[13px] transition-colors',
                    active ? 'text-ink' : 'text-muted hover:text-ink',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              )
            })}
            {accountLabel ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-[13px] text-muted transition-colors hover:text-ink disabled:opacity-50"
              >
                退出
              </button>
            ) : (
              <Link href={loginHref} className="text-[13px] text-muted transition-colors hover:text-ink">
                登录
              </Link>
            )}
          </nav>
        </div>
      </div>
      <ContactQrCodeModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </motion.header>
  )
}
