'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { Button } from '@/components/ui'
import { NavAuthControls } from '@/features/auth/components/NavAuthControls'
import '@/features/site-navigation/mobile-navigation.css'

const LINK_CLASS = 'rounded-btn px-3 py-2 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-blue sm:px-4'

export const LightNav = ({ onOpenCommunity }: { onOpenCommunity: () => void }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { locale, copy } = useSiteLocale()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const navItems = [
    { label: copy.navHome, href: locale === 'en' ? '/en' : '/' },
    { label: copy.navTemplates, href: '/templates' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    // 导航采用可展开菜单，不锁住页面；点外部、按 Escape 或回到桌面宽度时收起。
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 768px)')
    const onDesktop = () => { if (desktop.matches) setMenuOpen(false) }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onDesktop)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onDesktop)
    }
  }, [menuOpen])

  return (
    <header ref={headerRef} data-mobile-open={menuOpen} className="home-nav sticky top-0 z-30 w-full">
      <div
        // 玻璃只在滚动后出现：停在顶部时导航压着的是首屏留白，做成玻璃只会凭空
        // 多出一条横带。glass-medium 自带四周描边，但这是一条通栏，只有下缘该留线，
        // 左右和上缘用内联样式压掉——同为 utility 的 border-x-0 与 glass-medium
        // 处在同一层，谁覆盖谁取决于生成顺序，不可靠，内联样式才是确定的
        className={[
          'home-nav-surface transition-all duration-300',
          scrolled ? 'glass-medium' : 'border-b border-transparent',
        ].join(' ')}
        style={scrolled ? { borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 } : undefined}
      >
        <div className="home-nav-inner mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-x-3 px-4 sm:px-6 md:h-16 md:flex-nowrap">
          <Link href={locale === 'en' ? '/en' : '/'} onClick={() => setMenuOpen(false)} className="home-nav-brand flex items-center gap-2">
            <img src="/logo/weiyu-logo-web-dark.svg" alt={copy.brand} className="h-9 w-9" />
            <span className="text-[15px] font-semibold tracking-tight text-graphite">{copy.brand}</span>
          </Link>

          <nav
            id={menuId}
            aria-label={copy.mainNavigation}
            className="home-nav-links order-last flex w-full items-center justify-center gap-1 pb-2 md:order-none md:w-auto md:pb-0"
            onKeyDown={(event) => {
              if (event.key !== 'Tab' || !window.matchMedia('(max-width: 767px)').matches) return
              const links = event.currentTarget.querySelectorAll<HTMLElement>('a, button:not(:disabled)')
              // 菜单在 DOM 中位于操作按钮之前，移动端用显式焦点衔接保证 Tab 顺序连贯。
              if (event.shiftKey && event.target === links[0]) {
                event.preventDefault()
                menuButtonRef.current?.focus()
              } else if (!event.shiftKey && event.target === links[links.length - 1]) {
                setMenuOpen(false)
                menuButtonRef.current?.focus()
              }
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`${LINK_CLASS} ${
                  pathname === item.href
                    ? 'bg-blue/10 font-medium text-blue'
                    : 'text-graphite-soft hover:text-graphite'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button type="button" disabled title={copy.comingSoon} className={`${LINK_CLASS} flex cursor-not-allowed items-center gap-1.5 text-graphite-soft opacity-60`}>
              {copy.navAiSkills}
              <span className="rounded-full border border-current/20 px-1.5 py-0.5 text-[10px] leading-none">{copy.comingSoon}</span>
            </button>
          </nav>

          <div className="home-nav-actions flex h-16 items-center gap-2 sm:gap-3">
            {(pathname === '/' || pathname === '/en') && (
              <Link
                href={locale === 'en' ? '/' : '/en'}
                onNavigate={(event) => {
                  event.preventDefault()
                  setMenuOpen(false)
                  const path = locale === 'en' ? '/' : '/en'
                  router.push(`${path}${window.location.search}${window.location.hash}`, { scroll: false })
                }}
                hrefLang={locale === 'en' ? 'zh-CN' : 'en'}
                lang={locale === 'en' ? 'zh-CN' : 'en'}
                aria-label={locale === 'en' ? '切换到中文' : 'Switch to English'}
                className="rounded-btn px-2 py-2.5 text-[13px] text-graphite-soft transition-colors hover:text-blue focus-visible:outline-2 focus-visible:outline-blue"
              >
                {locale === 'en' ? '中文' : 'EN'}
              </Link>
            )}
            <Button variant="outline" aria-haspopup="dialog" onClick={() => { setMenuOpen(false); onOpenCommunity() }}>
              {copy.navAiCommunity}
            </Button>
            <NavAuthControls />
            <button
              ref={menuButtonRef}
              type="button"
              className="home-nav-toggle"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={locale === 'en' ? (menuOpen ? 'Close navigation' : 'Open navigation') : (menuOpen ? '关闭导航菜单' : '打开导航菜单')}
              onClick={() => setMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || (menuOpen && event.key === 'Tab' && !event.shiftKey)) {
                  event.preventDefault()
                  setMenuOpen(true)
                  requestAnimationFrame(() => headerRef.current?.querySelector<HTMLAnchorElement>('nav a')?.focus())
                }
              }}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
