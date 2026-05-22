import type { Metadata } from 'next'

import { BloggerCardStream } from '@/components/bloggers'
import {
  BloggerInsightFetchError,
  fetchBloggerInsightList,
} from '@/services/blogger-insights'
import { bloggerPlatformLabel } from '@/types/blogger-insight'

export const metadata: Metadata = {
  title: '一线博主拆解 · 真实博主深度洞察',
  description:
    '基于真实数据完成的一线博主深度拆解：账号画像 · 内容策略 · 变现路径 · 增长节点。一份一个博主，把别人验证过的经验变成你的 AI × 自媒体获客方法。',
  openGraph: {
    title: '博主洞察 · 微域生光',
    description: '我们分析过的真实博主，逐个看他们如何长出来。',
  },
}

interface BloggersPageProps {
  searchParams?: Promise<{
    platform?: string
    keyword?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function BloggersPage({ searchParams }: BloggersPageProps) {
  const resolved = (await searchParams) ?? {}
  const platform = normalize(resolved.platform)
  const keyword = normalize(resolved.keyword)

  let listResult
  let errorMessage: string | null = null
  try {
    listResult = await fetchBloggerInsightList({
      limit: 24,
      platform,
      keyword,
    })
  } catch (error) {
    listResult = {
      items: [],
      next_cursor: null,
      available_platforms: [],
      available_industries: [],
    }
    errorMessage =
      error instanceof BloggerInsightFetchError
        ? error.message
        : '博主洞察暂时无法加载，请稍后再试。'
  }

  const items = listResult.items

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            Blogger Insights
          </span>
          <h1 className="font-serif-zh text-[28px] font-semibold leading-[1.3] text-ink sm:text-[34px]">
            博主洞察 · 我们分析过的真实博主
          </h1>
        </div>
        <a
          href="/membership#submit-blogger"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-full bg-ink px-5 text-[13px] font-medium text-canvas transition-transform hover:-translate-y-0.5 sm:self-auto"
        >
          想拆某个博主？提交分析
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
            <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
          </svg>
        </a>
      </header>

      <BloggerFilterPanel
        platforms={listResult.available_platforms}
        activePlatform={platform}
        keyword={keyword}
      />

      {errorMessage && (
        <div className="mb-8 rounded-2xl border border-hairline bg-surface/60 p-4 text-[13px] text-muted">
          {errorMessage}
        </div>
      )}

      <BloggerCardStream
        initialItems={items}
        initialCursor={listResult.next_cursor}
        platform={platform}
        keyword={keyword}
        emptyMessage={
          errorMessage
            ? '请稍后刷新页面重试。'
            : keyword
              ? `没有匹配「${keyword}」的博主，换个关键词或清空搜索看看。`
              : '当前还没有匹配的博主拆解报告，调整一下筛选条件试试。'
        }
      />
    </div>
  )
}

function normalize(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const stripped = value.trim()
  return stripped === '' ? undefined : stripped
}

interface BloggerFilterPanelProps {
  platforms: string[]
  activePlatform: string | undefined
  keyword: string | undefined
}

function BloggerFilterPanel({ platforms, activePlatform, keyword }: BloggerFilterPanelProps) {
  const hasFilters = Boolean(keyword) || Boolean(activePlatform)
  const showPlatformChips = platforms.length > 0

  return (
    <form
      action="/bloggers"
      method="get"
      role="search"
      aria-label="筛选博主"
      className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-hairline bg-surface/40 px-4 py-2.5 transition-colors focus-within:border-hairline-strong sm:px-5 sm:py-3"
    >
      {activePlatform && <input type="hidden" name="platform" value={activePlatform} />}

      <div className="flex min-w-[200px] flex-1 items-center gap-2">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="h-[18px] w-[18px] shrink-0 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13.5 13.5 3 3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          name="keyword"
          defaultValue={keyword ?? ''}
          placeholder="搜索博主名称或描述"
          aria-label="搜索博主名称或描述"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted sm:text-[14.5px]"
        />
        <button
          type="submit"
          className="rounded-full border border-hairline bg-canvas/60 px-3 py-1 text-[12.5px] font-medium text-ink transition-colors hover:border-hairline-strong"
        >
          搜索
        </button>
      </div>

      {showPlatformChips && (
        <>
          <span aria-hidden className="hidden h-5 w-px bg-hairline sm:inline-block" />
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <span className="mr-0.5 font-mono uppercase tracking-[0.18em]">平台</span>
            <FilterChip label="全部" href={buildHref({ keyword })} active={!activePlatform} />
            {platforms.map((value) => (
              <FilterChip
                key={value}
                label={bloggerPlatformLabel(value)}
                href={buildHref({ platform: value, keyword })}
                active={activePlatform === value}
              />
            ))}
          </div>
        </>
      )}

      {hasFilters && (
        <a
          href="/bloggers"
          className="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
        >
          清除
        </a>
      )}
    </form>
  )
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  const baseClass =
    'rounded-full border px-3 py-1 text-[12px] transition-colors hover:border-hairline-strong'
  const activeClass = active
    ? 'border-hairline-strong bg-canvas/80 text-ink'
    : 'border-hairline text-muted hover:text-ink'
  return (
    <a href={href} className={`${baseClass} ${activeClass}`}>
      {label}
    </a>
  )
}

function buildHref(query: { platform?: string; keyword?: string }): string {
  const params = new URLSearchParams()
  if (query.platform) params.set('platform', query.platform)
  if (query.keyword) params.set('keyword', query.keyword)
  const text = params.toString()
  return text ? `/bloggers?${text}` : '/bloggers'
}
