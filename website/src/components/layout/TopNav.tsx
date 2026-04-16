import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: '首页', end: true },
  { to: '/cases', label: '案例' },
  { to: '/about', label: '关于' },
]

export const TopNav = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
          <NavLink to="/" className="group flex items-center gap-2">
            <img src="/logo/weiyu-logo-web-light.svg" alt="微域生光" className="h-9 w-9 sm:h-10 sm:w-10" />
            <span className="text-[15px] font-semibold tracking-tight text-ink transition-opacity group-hover:opacity-80 sm:text-base">
              微域生光
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'relative rounded-full px-4 py-1.5 text-[14px] transition-colors sm:text-[15px]',
                    isActive ? 'text-ink' : 'text-muted hover:text-ink',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-surface/70 backdrop-blur"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/about"
            className="group relative hidden overflow-hidden rounded-full border border-hairline bg-surface px-4 py-1.5 text-[14px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all hover:border-hairline-strong hover:shadow-[0_6px_20px_rgba(167,139,250,0.2)] md:inline-flex sm:text-[15px]"
          >
            <span className="relative z-10 flex items-center gap-1">
              成为伙伴
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
                fill="currentColor"
              >
                <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            </span>
          </NavLink>

          <nav className="flex items-center gap-3 md:hidden">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'text-[14px] transition-colors',
                    isActive ? 'text-ink' : 'text-muted hover:text-ink',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </motion.header>
  )
}
