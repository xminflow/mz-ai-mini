import Link from 'next/link'
import type { ReactNode } from 'react'
import type { TemplateLocale } from '../../../types'
import { STUDIO } from '../data'
import { SiteHeader } from './SiteHeader'
import { ReadingProgress, Reveal } from './Motion'

/**
 * 官网外壳：悬浮胶囊导航 + 页脚 CTA + 页脚，四个页面共用。
 *
 * 模板系统没有「模板级 layout」这一层（路由直接渲染页面组件），
 * 所以外壳只能由每个页面自己调用，activeSlug 由页面显式传入而不是从路由推断。
 */

interface NavItem {
  slug: string
  label: string
}

/**
 * 导航必须覆盖本端的全部页面——预览页不提供页面切换，
 * 导航里漏掉哪个页面，那个页面在预览里就点不到。新增页面时这里要同步加。
 */
export const NAV_ITEMS: NavItem[] = [
  { slug: '', label: '首页' },
  { slug: 'about', label: '关于' },
  { slug: 'works', label: '作品' },
  { slug: 'articles', label: '文章' },
  { slug: 'contact', label: '联系' },
]

export const NAV_ITEMS_EN: NavItem[] = [
  { slug: '', label: 'Home' },
  { slug: 'about', label: 'About' },
  { slug: 'works', label: 'Work' },
  { slug: 'articles', label: 'Journal' },
  { slug: 'contact', label: 'Contact' },
]

/**
 * 页脚的社交栏。渲染成不可点的 <span> 而不是 <a>：
 * 模板里没有真实账号，写成链接会让客户在预览里点出一个 404 或空白页。
 */
const SOCIAL_LINKS = ['微信公众号', '小红书', 'Behance', '站酷']

/** 站内链接一律基于 basePath 拼接，模板内部不感知自己被挂在 /templates 下。 */
export function hrefFor(basePath: string, slug: string): string {
  return slug ? `${basePath}/${slug}` : basePath
}

/**
 * 工作室标识：一个缺了右下角的方框。
 * 「留白」二字本身就是这个意思——图形不必再解释一遍，缺口自己会说话。
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M4 20V4h16v9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="square"
      />
      <path d="M4 20h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" />
    </svg>
  )
}

/** 右上箭头，按钮与链接上反复用到 */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
    </svg>
  )
}

interface SiteShellProps {
  basePath: string
  activeSlug: string
  children: ReactNode
  locale?: TemplateLocale
}

export function SiteShell({ basePath, activeSlug, children, locale = 'zh' }: SiteShellProps) {
  return (
    <div className="tpl-site min-h-screen">
      <ReadingProgress />
      <SiteHeader basePath={basePath} activeSlug={activeSlug} locale={locale} />
      <main>{children}</main>
      <SiteFooter basePath={basePath} locale={locale} />
      <Link href="/templates" className="tpl-market-logo" aria-label={locale === 'en' ? 'Back to Weelume templates' : '返回微域生光模板库'}>
        <img src="/logo/weiyu-logo-web-light.svg" alt="" aria-hidden />
        <span>{locale === 'en' ? 'Weelume' : '微域生光'}</span>
      </Link>
    </div>
  )
}

/**
 * 页脚。上半是近黑的 CTA 大块，下半是浅底的信息区。
 * 整站唯一一处深色，用来给长页面一个明确的结尾。
 */
function SiteFooter({ basePath, locale }: { basePath: string; locale: TemplateLocale }) {
  const isEnglish = locale === 'en'
  const navItems = isEnglish ? NAV_ITEMS_EN : NAV_ITEMS
  return (
    <footer className="px-6 pb-10 pt-16 sm:pt-24">
      <div className="mx-auto max-w-[1152px]">
        {/* 深色 CTA 块的圆角与内边距对齐 hero 大卡（32 / 96），
            它是整页唯一另一处「大卡」，两者不同规格会让页首页尾像两套东西。
            深底上也铺一层同规格的织纹，把纸感带到底。 */}
        <Reveal
          className="overflow-hidden rounded-[32px] bg-[var(--tpl-ink)] px-7 py-14 text-[var(--tpl-ink-invert)] sm:px-16 sm:py-24"
        >
          <div className="max-w-[560px]">
            <span className="tpl-pill !bg-[rgb(247_247_248/0.1)] !text-[rgb(247_247_248/0.66)]">
              {isEnglish ? 'Next project' : '下一个项目'}
            </span>
            <h2 className="tpl-display tpl-section-title mt-6">
              {isEnglish ? 'Tell us about your project,' : '说说你的项目，'}
              <br />
              {isEnglish ? 'we will find a clear direction' : '我们给你一个方向'}
            </h2>
            <p className="mt-4 tpl-copy text-[rgb(247_247_248/0.62)]">
              {isEnglish
                ? 'The first conversation is free. We will help clarify whether the project is a good fit before any proposal.'
                : '第一次沟通不收费，也不出方案。我们只判断这个项目适不适合我们做——说不合适的时候比说合适的时候多。'}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href={hrefFor(basePath, 'contact')}
                className="tpl-btn tpl-btn-light"
              >
                {isEnglish ? 'Start a project' : '开始一个项目'}
                <ArrowIcon className="w-4" />
              </Link>
              <a
                href={`mailto:${STUDIO.email}`}
                className="tpl-btn tpl-btn-muted"
              >
                {STUDIO.email}
              </a>
            </div>
          </div>
        </Reveal>

        {/* 页脚信息区：左边品牌 + 一句话，右边分栏。
            对应原型的「品牌简介 / Pages / Social」三段式——平铺一排链接读不出分类，
            而页脚恰恰是靠分栏标题让人一眼找到自己要的那一列。 */}
        <div className="mt-16 grid gap-10 border-t border-[var(--tpl-rule)] pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark className="w-[19px]" />
              <span className="tpl-display text-[19px]">{isEnglish ? 'Liubai Design Studio' : STUDIO.name}</span>
            </div>
            <p className="mt-4 max-w-[280px] text-[15px] leading-6 text-[var(--tpl-ink-dim)]">
              {isEnglish ? 'Clear thinking and careful execution for digital experiences that last.' : STUDIO.tagline}
            </p>
          </div>

          <div>
            <p className="text-[13px] tracking-[0.06em] text-[var(--tpl-ink-faint)]">{isEnglish ? 'Pages' : '页面'}</p>
            <nav className="mt-4 flex flex-col gap-2.5">
              {navItems.map((item) => (
                <Link
                  key={item.slug || 'home'}
                  href={hrefFor(basePath, item.slug)}
                  className="text-[15px] text-[var(--tpl-ink-dim)] transition-colors hover:text-[var(--tpl-ink)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 第三列是社交而不是联系方式：参考站页脚就是「品牌 / Pages / Social」三段，
              联系信息已经在上方的 CTA 块与联系页里出现过两次，页脚再列一遍是重复。 */}
          <div>
            <p className="text-[13px] tracking-[0.06em] text-[var(--tpl-ink-faint)]">{isEnglish ? 'Social' : '社交'}</p>
            <div className="mt-4 flex flex-col gap-2.5 text-[15px] leading-6 text-[var(--tpl-ink-dim)]">
              {(isEnglish ? ['WeChat', 'Rednote', 'Behance', 'Zcool'] : SOCIAL_LINKS).map((item) => (
                <span key={item} className="cursor-default transition-colors hover:text-[var(--tpl-ink)]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-[13px] text-[var(--tpl-ink-faint)]">
          © {STUDIO.founded}–2026 {isEnglish ? 'Liubai Design Studio' : STUDIO.name} · {STUDIO.latinName}
        </p>
      </div>
    </footer>
  )
}
