import { TrackCardStream } from './TrackCardStream'
import type { TrackAnalysisListResult } from '@/types/track-analysis'

interface TrackInsightListContentProps {
  listResult: TrackAnalysisListResult
  industry: string | undefined
  stance: string | undefined
  keyword: string | undefined
  errorMessage: string | null
}

export function TrackInsightListContent({
  listResult,
  industry,
  stance,
  keyword,
  errorMessage,
}: TrackInsightListContentProps) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-3">
          <a
            href="/library"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-ink"
          >
            ← Library
          </a>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            Track Analysis
          </span>
          <h1 className="font-serif-zh text-[28px] font-semibold leading-[1.3] text-ink sm:text-[34px]">
            赛道分析 · 消除信息差，找准真方向——看清全局，一步到位
          </h1>
          <p className="max-w-[640px] text-[13.5px] leading-[1.85] text-muted">
            每一份赛道分析包含 6 份子报告：执行摘要 / 行业研判 / 竞争格局 / 商业模式 /
            AI 落地 / 操盘手册。基于公开权威数据，用投研级框架还原。
          </p>
        </div>
        <a
          href="/membership#submit-track"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-full bg-ink px-5 text-[13px] font-medium text-canvas transition-transform hover:-translate-y-0.5 sm:self-auto"
        >
          想分析某个赛道？提交分析
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
            <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
          </svg>
        </a>
      </header>

      <TrackFilterPanel
        industries={listResult.available_industries}
        stances={listResult.available_stances}
        activeIndustry={industry}
        activeStance={stance}
        keyword={keyword}
      />

      {errorMessage && (
        <div className="mb-8 rounded-2xl border border-hairline bg-surface/60 p-4 text-[13px] text-muted">
          {errorMessage}
        </div>
      )}

      <TrackCardStream
        initialItems={listResult.items}
        initialCursor={listResult.next_cursor}
        industry={industry}
        stance={stance}
        keyword={keyword}
        emptyMessage={
          errorMessage
            ? '请稍后刷新页面重试。'
            : keyword
              ? `没有匹配「${keyword}」的赛道，换个关键词或清空搜索看看。`
              : '当前还没有匹配的赛道分析报告，调整一下筛选条件试试。'
        }
      />
    </div>
  )
}

interface TrackFilterPanelProps {
  industries: string[]
  stances: string[]
  activeIndustry: string | undefined
  activeStance: string | undefined
  keyword: string | undefined
}

function TrackFilterPanel({
  industries,
  stances,
  activeIndustry,
  activeStance,
  keyword,
}: TrackFilterPanelProps) {
  const hasFilters =
    Boolean(keyword) || Boolean(activeIndustry) || Boolean(activeStance)
  const showIndustry = industries.length > 0
  const showStance = stances.length > 0

  return (
    <form
      action="/library"
      method="get"
      role="search"
      aria-label="筛选赛道"
      className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-hairline bg-surface/40 px-4 py-2.5 transition-colors focus-within:border-hairline-strong sm:px-5 sm:py-3"
    >
      <input type="hidden" name="type" value="track" />
      {activeIndustry && (
        <input type="hidden" name="industry" value={activeIndustry} />
      )}
      {activeStance && <input type="hidden" name="stance" value={activeStance} />}

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
          placeholder="搜索赛道关键词或立场"
          aria-label="搜索赛道关键词或立场"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted sm:text-[14.5px]"
        />
        <button
          type="submit"
          className="rounded-full border border-hairline bg-canvas/60 px-3 py-1 text-[12.5px] font-medium text-ink transition-colors hover:border-hairline-strong"
        >
          搜索
        </button>
      </div>

      {showIndustry && (
        <>
          <span aria-hidden className="hidden h-5 w-px bg-hairline sm:inline-block" />
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <span className="mr-0.5 font-mono uppercase tracking-[0.18em]">行业</span>
            <FilterChip
              label="全部"
              href={buildHref({ stance: activeStance, keyword })}
              active={!activeIndustry}
            />
            {industries.map((value) => (
              <FilterChip
                key={value}
                label={value}
                href={buildHref({
                  industry: value,
                  stance: activeStance,
                  keyword,
                })}
                active={activeIndustry === value}
              />
            ))}
          </div>
        </>
      )}

      {showStance && (
        <>
          <span aria-hidden className="hidden h-5 w-px bg-hairline sm:inline-block" />
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <span className="mr-0.5 font-mono uppercase tracking-[0.18em]">立场</span>
            <FilterChip
              label="全部"
              href={buildHref({ industry: activeIndustry, keyword })}
              active={!activeStance}
            />
            {stances.map((value) => (
              <FilterChip
                key={value}
                label={value}
                href={buildHref({
                  industry: activeIndustry,
                  stance: value,
                  keyword,
                })}
                active={activeStance === value}
              />
            ))}
          </div>
        </>
      )}

      {hasFilters && (
        <a
          href="/library?type=track"
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

function buildHref(query: {
  industry?: string
  stance?: string
  keyword?: string
}): string {
  const params = new URLSearchParams()
  params.set('type', 'track')
  if (query.industry) params.set('industry', query.industry)
  if (query.stance) params.set('stance', query.stance)
  if (query.keyword) params.set('keyword', query.keyword)
  return `/library?${params.toString()}`
}
