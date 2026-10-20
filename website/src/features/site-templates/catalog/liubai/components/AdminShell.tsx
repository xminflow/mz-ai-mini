import Link from 'next/link'
import type { ReactNode } from 'react'
import { ADMIN_USER, STUDIO } from '../data'
import { BrandMark } from './SiteShell'

/**
 * 管理后台外壳：侧边导航 + 顶栏 + 内容容器，四个页面共用。
 *
 * 后台刻意不另起一套深色设计语言：同一套交付里官网与后台该看得出血缘。
 * 保留官网的冷灰底与无彩色体系，去掉织纹与宋体大标题，字号收紧、密度提高——
 * 一个每天要用两小时的界面，不需要印刷物的呼吸感。
 */

interface AdminNavItem {
  /** 有页面的菜单项才有 slug；占位项没有，渲染成不可点的条目 */
  slug?: string
  label: string
  icon: ReactNode
}

interface AdminNavGroup {
  label: string
  items: AdminNavItem[]
}

const iconClass = 'size-[17px] shrink-0'

const ICONS = {
  overview: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
  works: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 15.5l4.5-4 3.5 3 4-4.5L21 15" />
      <circle cx="8.5" cy="9" r="1.4" />
    </svg>
  ),
  leads: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
  settings: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2.6M12 18.4V21M21 12h-2.6M5.6 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" />
    </svg>
  ),
  articles: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 4h14v16H5z" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </svg>
  ),
  team: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 5M17.5 19a5.5 5.5 0 0 0-2.2-4.4" />
    </svg>
  ),
  stats: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20V10M10 20V4.5M16 20v-7M22 20H2" />
    </svg>
  ),
  media: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3L10 6h8.5A1.5 1.5 0 0 1 20 7.5v11A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5z" />
    </svg>
  ),
}

/**
 * 侧栏按职能分组。**只有带 slug 的四项有真实页面**，其余是占位项。
 *
 * 占位项渲染成不可点的 <span> 而不是 <Link>：指向不存在的 slug 会被 catch-all 直接 404，
 * 客户在预览里点一下就看到报错页，比菜单少几项难看得多。
 */
const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: '概览',
    items: [{ slug: '', label: '工作台', icon: ICONS.overview }],
  },
  {
    label: '内容',
    items: [
      { slug: 'works', label: "作品管理", icon: ICONS.works },
      { label: '文章', icon: ICONS.articles },
      { label: '图片素材', icon: ICONS.media },
    ],
  },
  {
    label: '客户',
    items: [
      { slug: 'leads', label: '客户咨询', icon: ICONS.leads },
      { label: '访问统计', icon: ICONS.stats },
    ],
  },
  {
    label: '设置',
    items: [
      { slug: 'settings', label: '站点设置', icon: ICONS.settings },
      { label: '成员与权限', icon: ICONS.team },
    ],
  },
]

/** 窄屏那条横向标签栏只列有真实页面的项——占位项点不动，只会白占位置。 */
const ADMIN_NAV_PAGES = ADMIN_NAV.flatMap((group) => group.items).filter(
  (item): item is AdminNavItem & { slug: string } => item.slug !== undefined,
)

function adminHref(basePath: string, slug: string): string {
  return slug ? `${basePath}/${slug}` : basePath
}

interface AdminShellProps {
  basePath: string
  activeSlug: string
  title: string
  subtitle: string
  /** 顶栏右侧的上下文操作区，各页自定义 */
  toolbar?: ReactNode
  children: ReactNode
}

export function AdminShell({
  basePath,
  activeSlug,
  title,
  subtitle,
  toolbar,
  children,
}: AdminShellProps) {
  return (
    <div className="tpl-admin flex min-h-screen">
      {/* 侧栏三档形态：窄屏隐藏（改用下方横向导航），中屏只留图标，宽屏图标加文字 */}
      <aside className="sticky top-0 hidden h-screen w-14 shrink-0 flex-col border-r border-[var(--tpl-rule)] bg-[var(--tpl-card)] md:flex xl:w-[212px]">
        <div className="flex h-14 items-center gap-2.5 border-b border-[var(--tpl-rule)] px-4">
          <BrandMark className="w-[18px] shrink-0" />
          <span className="hidden truncate text-[13px] font-medium xl:inline">
            {STUDIO.shortName} · 管理后台
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {ADMIN_NAV.map((group, groupIndex) => (
            <div key={group.label} className={groupIndex > 0 ? 'mt-3' : undefined}>
              {/* 分组标题只在宽屏出现；56px 的图标条里放不下文字，改用一条分隔线交代分组 */}
              <p className="hidden px-3 pb-1 pt-1 text-[10px] tracking-[0.16em] text-[var(--tpl-ink-faint)] xl:block">
                {group.label}
              </p>
              {groupIndex > 0 ? (
                <div className="mx-2 mb-1 border-t border-[var(--tpl-rule)] xl:hidden" aria-hidden />
              ) : null}

              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.slug !== undefined && item.slug === activeSlug
                  const base = 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]'

                  if (item.slug === undefined) {
                    return (
                      <span
                        key={item.label}
                        aria-disabled
                        title={item.label}
                        className={`${base} cursor-default text-[var(--tpl-ink-faint)]`}
                      >
                        {item.icon}
                        <span className="hidden xl:inline">{item.label}</span>
                      </span>
                    )
                  }

                  return (
                    <Link
                      key={item.slug || 'home'}
                      href={adminHref(basePath, item.slug)}
                      aria-current={active ? 'page' : undefined}
                      title={item.label}
                      className={
                        active
                          ? `${base} bg-[var(--tpl-accent-soft)] font-medium text-[var(--tpl-accent)]`
                          : `${base} text-[var(--tpl-ink-dim)] transition-colors hover:bg-[var(--tpl-paper-admin)] hover:text-[var(--tpl-ink)]`
                      }
                    >
                      {item.icon}
                      <span className="hidden xl:inline">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-[var(--tpl-rule)] p-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--tpl-accent-soft)] text-[12px] text-[var(--tpl-accent)]">
            {ADMIN_USER.initial}
          </span>
          <div className="hidden min-w-0 xl:block">
            <p className="truncate text-[12.5px] font-medium">{ADMIN_USER.name}</p>
            <p className="truncate text-[11px] text-[var(--tpl-ink-faint)]">{ADMIN_USER.role}</p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-[var(--tpl-rule)] bg-[rgb(247_246_243/0.86)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-medium">{title}</h1>
              <p className="mt-0.5 truncate text-[12px] text-[var(--tpl-ink-dim)]">{subtitle}</p>
            </div>
            {toolbar}
          </div>

          {/* 窄屏专用导航：侧栏在 md 以下整条隐藏，这里补一条可横向滚动的标签栏 */}
          <nav className="flex gap-1 overflow-x-auto border-t border-[var(--tpl-rule)] px-3 py-1.5 md:hidden">
            {ADMIN_NAV_PAGES.map((item) => {
              const active = item.slug === activeSlug
              return (
                <Link
                  key={item.slug || 'home'}
                  href={adminHref(basePath, item.slug)}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'shrink-0 rounded-lg bg-[var(--tpl-accent-soft)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--tpl-accent)]'
                      : 'shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--tpl-ink-dim)]'
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">{children}</main>

        <footer className="border-t border-[var(--tpl-rule)] px-4 py-4 text-[11.5px] text-[var(--tpl-ink-faint)] sm:px-6">
          {STUDIO.name} 管理后台 · 内容更新后约 1 分钟同步到官网
        </footer>
      </div>
    </div>
  )
}

/** 后台通用面板：白底、细描边、标题行。表格与列表都装在它里面。 */
export function AdminPanel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-[var(--tpl-rule)] bg-[var(--tpl-card)] ${className ?? ''}`}
    >
      <div className="flex items-center gap-3 border-b border-[var(--tpl-rule)] px-4 py-3">
        <h2 className="text-[13px] font-medium">{title}</h2>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      <div className={bodyClassName ?? 'p-4'}>{children}</div>
    </section>
  )
}

export type BadgeTone = 'ok' | 'warn' | 'crit' | 'accent' | 'plain'

const BADGE_CLASS: Record<BadgeTone, string> = {
  ok: 'bg-[var(--tpl-ok-soft)] text-[var(--tpl-ok)]',
  warn: 'bg-[var(--tpl-warn-soft)] text-[var(--tpl-warn)]',
  crit: 'bg-[var(--tpl-crit-soft)] text-[var(--tpl-crit)]',
  accent: 'bg-[var(--tpl-accent-soft)] text-[var(--tpl-accent)]',
  plain: 'bg-[rgb(18_18_24/0.05)] text-[var(--tpl-ink-faint)]',
}

export function Badge({ tone, children }: { tone: BadgeTone; children: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11.5px] ${BADGE_CLASS[tone]}`}
    >
      {children}
    </span>
  )
}

/** 顶栏右侧常用的一组只读筛选控件。做成视觉态，不接交互逻辑。 */
export function ToolbarChips({ items, activeIndex = 0 }: { items: string[]; activeIndex?: number }) {
  return (
    <div className="flex shrink-0 items-center rounded-lg border border-[var(--tpl-rule)] bg-[var(--tpl-card)] p-0.5">
      {items.map((item, index) => (
        <span
          key={item}
          className={
            index === activeIndex
              ? 'rounded-md bg-[var(--tpl-paper-admin)] px-2.5 py-1 text-[12px] font-medium'
              : 'px-2.5 py-1 text-[12px] text-[var(--tpl-ink-dim)]'
          }
        >
          {item}
        </span>
      ))}
    </div>
  )
}
