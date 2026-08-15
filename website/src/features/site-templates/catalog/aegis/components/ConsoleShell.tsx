import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * 控制台外壳：侧边导航 + 顶栏 + 内容容器，五个页面共用。
 *
 * 模板系统没有「模板级 layout」这一层（路由直接渲染页面组件），
 * 所以外壳只能由每个页面自己调用，activeSlug 由页面显式传入而不是从路由推断。
 */

interface NavItem {
  slug: string
  label: string
  icon: ReactNode
}

const iconClass = 'size-[18px] shrink-0'

/** 侧栏图标统一 18px 线性风格，stroke 走 currentColor 以跟随选中态配色。 */
const ICONS = {
  overview: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  project: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 13h4l2.5-7 4 14 2.5-7h5" />
    </svg>
  ),
  logs: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h16M4 11h11M4 16h16M4 21h8" />
    </svg>
  ),
  alerts: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </svg>
  ),
  inspect: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8.2 7.5 9.5 4.4-1.3 7.5-5.1 7.5-9.5V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  rules: (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h9M17 18h3" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="18" r="2" />
    </svg>
  ),
}

const NAV_ITEMS: NavItem[] = [
  { slug: '', label: '项目总览', icon: ICONS.overview },
  { slug: 'project', label: '项目监控', icon: ICONS.project },
  { slug: 'inspect', label: '智能体巡检', icon: ICONS.inspect },
  { slug: 'logs', label: '日志与异常', icon: ICONS.logs },
  { slug: 'alerts', label: '告警中心', icon: ICONS.alerts },
  { slug: 'rules', label: '规则配置', icon: ICONS.rules },
]

/** 站内链接一律基于 basePath 拼接，模板内部不感知自己被挂在 /templates 下。 */
function hrefFor(basePath: string, slug: string): string {
  return slug ? `${basePath}/${slug}` : basePath
}

interface ConsoleShellProps {
  basePath: string
  activeSlug: string
  title: string
  /** 标题下方的一句话说明 */
  subtitle: string
  /** 顶栏右侧的上下文操作区，各页自定义（时间范围、筛选等） */
  toolbar?: ReactNode
  children: ReactNode
}

export function ConsoleShell({ basePath, activeSlug, title, subtitle, toolbar, children }: ConsoleShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--tpl-surface)]">
      {/* 侧栏三档形态：窄屏隐藏（改用下方横向导航），中屏只留图标，宽屏图标加文字。
          这是本模板在预览页三档视口下最直观的响应式表现。 */}
      <aside className="sticky top-0 hidden h-screen w-14 shrink-0 flex-col border-r border-[var(--tpl-rule)] bg-[var(--tpl-bg)] md:flex xl:w-56">
        <div className="flex h-14 items-center gap-2.5 border-b border-[var(--tpl-rule)] px-4">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-[5px] bg-[var(--tpl-accent)] text-[11px] font-bold text-white">
            微
          </span>
          <span className="hidden truncate text-[13px] font-semibold tracking-tight xl:inline">
            微域智能运维
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {NAV_ITEMS.map((item) => {
            const active = item.slug === activeSlug
            return (
              <Link
                key={item.slug || 'home'}
                href={hrefFor(basePath, item.slug)}
                aria-current={active ? 'page' : undefined}
                title={item.label}
                className={
                  active
                    ? 'flex items-center gap-2.5 rounded-md bg-[var(--tpl-accent-soft)] px-3 py-2 text-[13px] font-medium text-[var(--tpl-accent)]'
                    : 'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-[var(--tpl-fg-dim)] transition hover:bg-[var(--tpl-surface)] hover:text-[var(--tpl-fg)]'
                }
              >
                {item.icon}
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[var(--tpl-rule)] p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--tpl-rule)] text-[11px] font-medium text-[var(--tpl-fg-dim)]">
              陈
            </span>
            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-[12px] font-medium">陈见山</p>
              <p className="truncate text-[11px] text-[var(--tpl-fg-faint)]">值班中 · 生产环境</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-[var(--tpl-rule)] bg-[var(--tpl-bg)]/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
              <p className="mt-0.5 truncate text-[12px] text-[var(--tpl-fg-dim)]">{subtitle}</p>
            </div>
            {toolbar}
          </div>

          {/* 窄屏专用导航：侧栏在 md 以下整条隐藏，这里补一条可横向滚动的标签栏 */}
          <nav className="tpl-scroll flex gap-1 overflow-x-auto border-t border-[var(--tpl-rule)] px-3 py-1.5 md:hidden">
            {NAV_ITEMS.map((item) => {
              const active = item.slug === activeSlug
              return (
                <Link
                  key={item.slug || 'home'}
                  href={hrefFor(basePath, item.slug)}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'shrink-0 rounded-md bg-[var(--tpl-accent-soft)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--tpl-accent)]'
                      : 'shrink-0 rounded-md px-2.5 py-1.5 text-[12px] text-[var(--tpl-fg-dim)]'
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>

        <footer className="border-t border-[var(--tpl-rule)] px-4 py-4 text-[11px] text-[var(--tpl-fg-faint)] sm:px-6">
          微域智能运维平台 · 数据窗口 最近 24 小时 · 采集延迟 &lt; 15s
        </footer>
      </div>
    </div>
  )
}

/** 顶栏右侧常用的一组只读筛选控件。做成视觉态，不接交互逻辑。 */
export function ToolbarChips({ items, activeIndex = 0 }: { items: string[]; activeIndex?: number }) {
  return (
    <div className="flex shrink-0 items-center rounded-md border border-[var(--tpl-rule)] bg-[var(--tpl-bg)] p-0.5">
      {items.map((item, index) => (
        <span
          key={item}
          className={
            index === activeIndex
              ? 'rounded-[5px] bg-[var(--tpl-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--tpl-fg)]'
              : 'px-2.5 py-1 text-[12px] text-[var(--tpl-fg-dim)]'
          }
        >
          {item}
        </span>
      ))}
    </div>
  )
}
