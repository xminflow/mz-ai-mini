'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { AuthState } from '@/features/auth/types'
import type {
  TrackAnalysisDetail,
  TrackReportContent,
} from '@/types/track-analysis'

interface TrackReportShellProps {
  detail: TrackAnalysisDetail
  initialReport: TrackReportContent
  authState: AuthState
  loginNext: string
}

interface CachedReport {
  status: 'loading' | 'ready' | 'error'
  data?: TrackReportContent
  error?: string
}

export function TrackReportShell({
  detail,
  initialReport,
  authState,
  loginNext,
}: TrackReportShellProps) {
  const initialCache: Record<string, CachedReport> = useMemo(
    () => ({
      [initialReport.key]: { status: 'ready', data: initialReport },
    }),
    [initialReport],
  )

  const [cache, setCache] =
    useState<Record<string, CachedReport>>(initialCache)
  const [activeKey, setActiveKey] = useState<string>(initialReport.key)

  // Tab 在初次挂载时从 URL 同步：刷新页面 / 分享 deep link 时直接定位到对应 Tab。
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabFromUrl = params.get('tab')
    if (!tabFromUrl) return
    const exists = detail.report_metas.some((meta) => meta.key === tabFromUrl)
    if (!exists) return
    if (tabFromUrl !== initialReport.key) {
      setActiveKey(tabFromUrl)
    }
  }, [detail.report_metas, initialReport.key])

  const ensureReport = useCallback(
    async (key: string) => {
      setCache((prev) => {
        if (prev[key]?.status === 'ready' || prev[key]?.status === 'loading') {
          return prev
        }
        return { ...prev, [key]: { status: 'loading' } }
      })
      try {
        const url = `/api/tracks/${encodeURIComponent(
          detail.slug,
        )}/reports/${encodeURIComponent(key)}`
        const response = await fetch(url, { credentials: 'same-origin' })
        const payload = (await response.json().catch(() => ({}))) as
          | TrackReportContent
          | { error?: { code?: string; message?: string } }
        if (!response.ok) {
          const message =
            (payload as { error?: { message?: string } }).error?.message ??
            '加载报告失败'
          throw new Error(message)
        }
        setCache((prev) => ({
          ...prev,
          [key]: { status: 'ready', data: payload as TrackReportContent },
        }))
      } catch (err) {
        setCache((prev) => ({
          ...prev,
          [key]: {
            status: 'error',
            error: err instanceof Error ? err.message : '加载报告失败',
          },
        }))
      }
    },
    [detail.slug],
  )

  const switchTab = useCallback(
    (key: string) => {
      if (key === activeKey) return
      setActiveKey(key)
      const current = cache[key]
      if (current?.status !== 'ready' && current?.status !== 'loading') {
        void ensureReport(key)
      }
      // 浅路由：把当前 tab 写到 URL，分享时可直接跳到这个 Tab。
      const url = new URL(window.location.href)
      url.searchParams.set('tab', key)
      window.history.replaceState(null, '', url.toString())
    },
    [activeKey, cache, ensureReport],
  )

  // 首次挂载时如果 URL 指定的 tab 不是 initialReport，要按需触发其加载。
  useEffect(() => {
    if (activeKey === initialReport.key) return
    const current = cache[activeKey]
    if (current?.status === 'ready' || current?.status === 'loading') return
    void ensureReport(activeKey)
  }, [activeKey, cache, ensureReport, initialReport.key])

  const activeCache = cache[activeKey]

  return (
    <div className="flex min-h-screen flex-col bg-[#050507] text-[#fffdf7]">
      <TopBar detail={detail} authState={authState} loginNext={loginNext} />

      <div className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
        {/* 移动端：tab 在顶部横向滚动；桌面端：tab 在左侧纵向 sticky */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
          <ReportTabs
            metas={detail.report_metas}
            activeKey={activeKey}
            onSwitch={switchTab}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <ReportFrame
              key={`${detail.slug}-${activeKey}`}
              activeKey={activeKey}
              cached={activeCache}
              onRetry={() => ensureReport(activeKey)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ReportTabsProps {
  metas: TrackAnalysisDetail['report_metas']
  activeKey: string
  onSwitch: (key: string) => void
}

function ReportTabs({ metas, activeKey, onSwitch }: ReportTabsProps) {
  return (
    <aside
      aria-label="赛道报告目录"
      className="lg:sticky lg:top-[96px] lg:w-[192px] lg:shrink-0"
    >
      {/* 桌面端：抽屉式目录 */}
      <nav className="hidden lg:block">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.4em] text-[#5a5550]">
          报告目录
        </p>
        <ol className="flex flex-col gap-0.5">
          {metas.map((meta, index) => {
            const isActive = meta.key === activeKey
            return (
              <li key={meta.key}>
                <button
                  type="button"
                  onClick={() => onSwitch(meta.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150',
                    isActive
                      ? 'bg-white/[0.07] text-[#F5F5F7]'
                      : 'text-[#7d7a75] hover:bg-white/[0.04] hover:text-[#c8c4be]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'w-[18px] shrink-0 font-mono text-[10px] leading-none',
                      isActive ? 'text-[#10b981]' : 'text-[#4a4845]',
                    ].join(' ')}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[13px] leading-snug">{meta.title}</span>
                  {isActive && (
                    <span className="ml-auto shrink-0 text-[#10b981]">›</span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* 移动端：横向滚动 chip */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
        {metas.map((meta, index) => {
          const isActive = meta.key === activeKey
          return (
            <button
              key={meta.key}
              type="button"
              onClick={() => onSwitch(meta.key)}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] transition-colors',
                isActive
                  ? 'border-white/15 bg-white/[0.07] text-[#F5F5F7]'
                  : 'border-white/8 bg-transparent text-[#7d7a75] hover:text-[#c8c4be]',
              ].join(' ')}
            >
              <span className={['font-mono text-[9.5px]', isActive ? 'text-[#10b981]' : 'text-[#4a4845]'].join(' ')}>
                {String(index + 1).padStart(2, '0')}
              </span>
              {meta.title}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

interface ReportFrameProps {
  activeKey: string
  cached: CachedReport | undefined
  onRetry: () => void
}

// 通过 `key={slug-activeKey}` 在 Tab 切换时强制重新挂载，使内部 useState/ref
// 自然回到初始状态——避免在 useEffect 中调用 setState 重置高度（react-hooks/
// set-state-in-effect）。每次挂载从默认 800 起步，onLoad 后按真实 scrollHeight 调整。
function ReportFrame({ activeKey, cached, onRetry }: ReportFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [iframeHeight, setIframeHeight] = useState<number>(800)

  const handleLoad = useCallback(() => {
    const node = iframeRef.current
    if (!node) return
    try {
      const doc = node.contentDocument
      if (!doc?.documentElement) return
      const measure = () => {
        const next = Math.max(
          doc.body?.scrollHeight ?? 0,
          doc.documentElement.scrollHeight ?? 0,
        )
        if (Number.isFinite(next) && next > 0) {
          setIframeHeight(next)
        }
      }
      measure()
      if (typeof ResizeObserver !== 'undefined' && doc.body) {
        const observer = new ResizeObserver(() => {
          // 报告里的 Chart.js / Tailwind layout 在窗口大小变化时也会重排，跟随调整。
          measure()
        })
        observer.observe(doc.body)
        const onWindowResize = () => measure()
        window.addEventListener('resize', onWindowResize, { passive: true })
        cleanupRef.current = () => {
          observer.disconnect()
          window.removeEventListener('resize', onWindowResize)
        }
      }
    } catch {
      // 同源 iframe 在某些 Safari 版本短暂存在跨域错觉；忽略，保留默认高度
    }
  }, [])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [])

  if (!cached) {
    return <SkeletonBlock label="准备加载报告…" />
  }
  if (cached.status === 'loading') {
    return <SkeletonBlock label="加载报告中…" />
  }
  if (cached.status === 'error') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-[13px] text-[#c8c0b3]">
        报告加载失败：{cached.error}
        <button
          type="button"
          onClick={onRetry}
          className="ml-3 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[12px] text-[#fffdf7] transition-colors hover:border-white/30"
        >
          重试
        </button>
      </div>
    )
  }
  const rawHtml = cached.data?.html
  if (!rawHtml) {
    return <SkeletonBlock label="报告内容为空" />
  }
  // track-research 产出的报告 HTML 自带极光 radial-gradient + background-attachment: fixed。
  // 在嵌入式 iframe 里 fixed 会把渐变锁在 iframe 视口上，外层滚动时给人「背景渐变随
  // 滚动浮动」的错觉。这里在 </head> 前注入一段高优先级覆盖，把 body 的渐变图像剥掉
  // 并把 attachment 改成 scroll，让正文背景真正成为静态 #050507。
  const html = injectFlatBodyBackground(rawHtml)
  // 不再用任何 wrapper / 边框 / 圆角——对齐博主洞察详情页"HTML 直接挂在主域"
  // 的视觉效果，让报告 HTML 与外层页面无缝衔接。iframe 元素本身预涂 #050507
  // 避免 srcDoc 解析前出现白色闪烁。
  return (
    <iframe
      ref={iframeRef}
      title={cached.data?.title ?? `赛道报告 - ${activeKey}`}
      srcDoc={html}
      onLoad={handleLoad}
      sandbox="allow-same-origin allow-scripts"
      className="block w-full border-0"
      style={{
        height: `${iframeHeight}px`,
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#050507',
      }}
    />
  )
}

const FLAT_BODY_BG_OVERRIDE = `<style data-wlx-bg-override>html,body{background-image:none !important;background-attachment:scroll !important;background-color:#050507 !important;}</style>`

function injectFlatBodyBackground(html: string): string {
  // 大多数报告 HTML 是标准结构，存在 </head>；少数极端情况下兜底把覆盖放到最前面，
  // 仍能在大多数浏览器里命中（浏览器会按文档顺序解析样式）。
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${FLAT_BODY_BG_OVERRIDE}</head>`)
  }
  return `${FLAT_BODY_BG_OVERRIDE}${html}`
}

function SkeletonBlock({ label }: { label: string }) {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] font-mono text-[11px] uppercase tracking-[0.22em] text-[#b8aa96]">
      {label}
    </div>
  )
}

interface TopBarProps {
  detail: TrackAnalysisDetail
  authState: AuthState
  loginNext: string
}

function TopBar({ detail, authState, loginNext }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050507]">
      <div className="mx-auto flex h-[56px] w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:h-[64px] sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <a
            href="/tracks"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-[#d6cfc4] transition-colors hover:border-[#b8693a]/60 hover:bg-[#b8693a]/15 hover:text-[#fffdf7]"
          >
            <span aria-hidden>←</span>
            返回赛道分析
          </a>
          <span
            aria-hidden
            className="hidden h-5 w-px shrink-0 bg-white/15 sm:inline-block"
          />
          <h1 className="font-serif-zh truncate text-[15px] font-semibold text-[#fffdf7] sm:text-[17px]">
            {detail.track_keyword}
          </h1>
          {detail.stance && (
            <span className="hidden shrink-0 rounded-full border border-[#b8693a]/60 bg-[#b8693a]/15 px-2 py-0.5 text-[11px] text-[#fffdf7] sm:inline-block">
              {detail.stance}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {detail.industry && (
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8aa96] lg:inline">
              #{detail.industry}
            </span>
          )}
          <TopBarAuthControls authState={authState} loginNext={loginNext} />
        </div>
      </div>
    </header>
  )
}

interface TopBarAuthControlsProps {
  authState: AuthState
  loginNext: string
}

// 与博主洞察详情页的登录块保持一致：未登录显示「登录」按钮；已登录显示账号入口
// + 「退出」按钮。退出走与博主页相同的 /api/auth/logout 通道，成功后刷新页面让
// 服务端 RSC 重新拉取 authState。
function TopBarAuthControls({ authState, loginNext }: TopBarAuthControlsProps) {
  const [pendingLogout, setPendingLogout] = useState(false)

  if (!authState.authenticated) {
    const loginHref = `/login?next=${encodeURIComponent(loginNext)}`
    return (
      <a
        href={loginHref}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-[#d6cfc4] transition-colors hover:border-[#b8693a]/60 hover:bg-[#b8693a]/15 hover:text-[#fffdf7]"
      >
        登录
      </a>
    )
  }

  const accountLabel =
    authState.account.email?.trim() ||
    authState.account.username?.trim() ||
    '已登录'

  const handleLogout = async () => {
    if (pendingLogout) return
    setPendingLogout(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })
    } catch {
      // 退出失败也强制刷新——cookie 可能已被服务端清除，重新加载会回到未登录态。
    } finally {
      window.location.reload()
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
      <a
        href="/account"
        className="max-w-[120px] truncate font-mono text-[11px] uppercase tracking-[0.18em] text-[#b8aa96] transition-colors hover:text-[#fffdf7] sm:text-[11.5px]"
      >
        {accountLabel}
      </a>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pendingLogout}
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8aa96] transition-colors hover:text-[#fffdf7] disabled:cursor-default disabled:opacity-50 sm:text-[11px]"
      >
        {pendingLogout ? '退出中' : '退出'}
      </button>
    </div>
  )
}
