'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ContactQrCodeModal } from './ContactQrCodeModal'

const NAV_LINKS = [
  { href: '/', label: '首页', exact: true },
  { href: '/cases', label: '行业报告' },
  { href: '/ai-services', label: 'AI+服务' },
  { href: '/about', label: '关于' },
]

export const TopNav = () => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (link: (typeof NAV_LINKS)[number]) =>
    link.exact ? pathname === link.href : pathname.startsWith(link.href)

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
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'relative rounded-full px-4 py-1.5 text-[14px] transition-colors sm:text-[15px]',
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
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="group relative hidden overflow-hidden rounded-full border border-hairline bg-surface px-4 py-1.5 text-[14px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:border-hairline-strong hover:shadow-[0_6px_20px_rgba(167,139,250,0.2)] md:inline-flex sm:text-[15px]"
          >
            联系我们
          </button>

          <nav className="flex items-center gap-3 md:hidden">
            {NAV_LINKS.map((link) => {
              const active = isActive(link)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'text-[14px] transition-colors',
                    active ? 'text-ink' : 'text-muted hover:text-ink',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      <ContactQrCodeModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </motion.header>
  )
}
