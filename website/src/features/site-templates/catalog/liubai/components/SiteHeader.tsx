'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import type { TemplateLocale } from '../../../types'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { STUDIO } from '../data'
import { ArrowIcon, BrandMark, NAV_ITEMS, NAV_ITEMS_EN, hrefFor } from './SiteShell'

/**
 * 顶部导航。**两种形态,靠滚动切换**——这是参考站首屏最有辨识度的一处:
 *
 * - 页面顶部:通栏、透明、无底色,logo 贴容器左缘、按钮贴右缘,和内容同宽（1152）
 * - 一旦滚动:收成一颗居中的白色胶囊,浮在内容之上
 *
 * 本组件管理滚动状态和手机端折叠菜单；页面内容仍由服务端组件渲染。
 */
export function SiteHeader({ basePath, activeSlug, locale = 'zh' }: { basePath: string; activeSlug: string; locale?: TemplateLocale }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const reduced = useReducedMotion()
  const isEnglish = locale === 'en'
  const navItems = isEnglish ? NAV_ITEMS_EN : NAV_ITEMS
  const zhPath = basePath.replace(/\/en$/, '')
  const languageHref = isEnglish ? zhPath : `${basePath}/en`

  useEffect(() => {
    // 阈值取 40:小于一次滚轮的距离,手指刚一动胶囊就出来,不会有"滚了半屏还没变"的迟滞
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-40 px-6"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setMenuOpen(false)
          event.currentTarget.querySelector<HTMLButtonElement>('[aria-controls]')?.focus()
        }
      }}
    >
      <div
        className={`pointer-events-auto relative mx-auto mt-4 flex max-w-[1152px] items-center gap-3 rounded-2xl bg-[var(--tpl-card)] p-2 pl-4 shadow-sm transition-[max-width,background-color,box-shadow,padding,margin] duration-300 ease-out md:rounded-full ${
          scrolled
            ? 'md:max-w-max md:gap-2 md:pl-5 shadow-[0_1px_2px_rgb(18_18_24/0.04),0_12px_28px_-16px_rgb(18_18_24/0.28)]'
            : 'md:mt-0 md:gap-6 md:bg-transparent md:py-6 md:pl-0 md:pr-0 md:shadow-none'
        }`}
      >
        <Link href={basePath} className="flex shrink-0 items-center gap-2">
          <BrandMark className="w-[19px] text-[var(--tpl-ink)]" />
          <span className="tpl-title text-[18px]">{isEnglish ? 'Liubai' : STUDIO.shortName}</span>
        </Link>

        {/* 顶部形态下导航要居中在 1152 容器里,所以给 flex-1;
            胶囊形态下容器是 max-w-max,flex-1 不起作用,导航自然贴着 logo 排 */}
        <nav aria-label={isEnglish ? 'Primary navigation' : '主导航'} className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const active = item.slug === activeSlug
            return (
              <Link
                key={item.slug || 'home'}
                href={hrefFor(basePath, item.slug)}
                aria-current={active ? 'page' : undefined}
                className="tpl-navlink"
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Link
          href={hrefFor(basePath, 'contact')}
          className="tpl-btn ml-auto shrink-0 !px-4 md:ml-0"
        >
          <span>{isEnglish ? 'Start a project' : '聊聊项目'}</span>
          <ArrowIcon className="w-3.5" />
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? (isEnglish ? 'Close navigation' : '收起导航菜单') : (isEnglish ? 'Open navigation' : '展开导航菜单')}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--tpl-surface)] md:hidden"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d={menuOpen ? 'm6 6 12 12M6 18 18 6' : 'M4 8h16M4 16h16'} />
          </svg>
        </button>

        <AnimatePresence initial={false}>{menuOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: reduced ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -6 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            id={menuId}
            aria-label={isEnglish ? 'Mobile navigation' : '手机导航'}
            className="absolute inset-x-0 top-[calc(100%+12px)] flex flex-col gap-1 rounded-2xl border border-[var(--tpl-rule)] bg-[var(--tpl-card)] p-3 shadow-lg md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.slug || 'home'}
                href={hrefFor(basePath, item.slug)}
                aria-current={item.slug === activeSlug ? 'page' : undefined}
                className="tpl-navlink !py-3"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>
        ) : null}</AnimatePresence>
        <Link href={languageHref} className="tpl-language-switch" aria-label={isEnglish ? '切换中文' : 'Switch to English'}>
          {isEnglish ? '中' : 'EN'}
        </Link>
      </div>
    </motion.header>
  )
}
