import Link from 'next/link'

import {
  pickKeyNumberHighlights,
  type TrackAnalysisListItem,
} from '@/types/track-analysis'

interface TrackInsightCardProps {
  item: TrackAnalysisListItem
}

interface StanceTheme {
  dot: string
  pill: string
  orb: string
  bar: string
  accent: string
  hoverShadow: string
}

const STANCE_THEMES: Record<
  'positive' | 'cautious' | 'negative' | 'neutral',
  StanceTheme
> = {
  positive: {
    dot: 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.7)]',
    pill: 'border-emerald-300/35 bg-emerald-300/[0.08] text-emerald-200',
    orb: 'from-emerald-300/70 to-cyan-300/60',
    bar: 'from-transparent via-emerald-300/60 to-transparent',
    accent: 'text-emerald-200',
    hoverShadow: 'hover:shadow-[0_24px_60px_-30px_rgba(52,211,153,0.45)]',
  },
  cautious: {
    dot: 'bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.7)]',
    pill: 'border-amber-300/35 bg-amber-300/[0.08] text-amber-200',
    orb: 'from-amber-300/70 to-rose-300/60',
    bar: 'from-transparent via-amber-300/60 to-transparent',
    accent: 'text-amber-200',
    hoverShadow: 'hover:shadow-[0_24px_60px_-30px_rgba(252,211,77,0.4)]',
  },
  negative: {
    dot: 'bg-rose-300 shadow-[0_0_10px_rgba(252,165,165,0.7)]',
    pill: 'border-rose-300/35 bg-rose-300/[0.08] text-rose-200',
    orb: 'from-rose-300/70 to-fuchsia-300/60',
    bar: 'from-transparent via-rose-300/60 to-transparent',
    accent: 'text-rose-200',
    hoverShadow: 'hover:shadow-[0_24px_60px_-30px_rgba(244,114,182,0.4)]',
  },
  neutral: {
    dot: 'bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.7)]',
    pill: 'border-violet-300/35 bg-violet-300/[0.08] text-violet-200',
    orb: 'from-violet-300/70 to-cyan-300/60',
    bar: 'from-transparent via-violet-300/60 to-transparent',
    accent: 'text-violet-200',
    hoverShadow: 'hover:shadow-[0_24px_60px_-30px_rgba(167,139,250,0.45)]',
  },
}

// 立场字符串到色板的映射：来自报告模板的硬规范——看好 / 谨慎 / 看空
// 顺序：先匹配看空（最负向），再匹配谨慎（含"谨慎看好"也算保留态度），最后看好
function resolveStanceTheme(stance: string | null): StanceTheme {
  if (!stance) return STANCE_THEMES.neutral
  if (/看空|不可切|否定|放弃|警惕|悲观/.test(stance)) return STANCE_THEMES.negative
  if (/谨慎|观望|缓切|中性|分化/.test(stance)) return STANCE_THEMES.cautious
  if (/看好|积极|推荐|可切|建议切|乐观/.test(stance)) return STANCE_THEMES.positive
  return STANCE_THEMES.neutral
}

const REGION_CHIP =
  'border-cyan-300/25 bg-cyan-300/[0.06] text-cyan-100'
const AUDIENCE_CHIP =
  'border-pink-300/25 bg-pink-300/[0.06] text-pink-100'

// Tailwind v4 不识别动态类名，必须把完整 class 串静态写出来
const TAG_PALETTE: string[] = [
  'border-violet-300/25 bg-violet-300/[0.06] text-violet-100',
  'border-emerald-300/25 bg-emerald-300/[0.06] text-emerald-100',
  'border-amber-300/25 bg-amber-300/[0.06] text-amber-100',
  'border-sky-300/25 bg-sky-300/[0.06] text-sky-100',
  'border-fuchsia-300/25 bg-fuchsia-300/[0.06] text-fuchsia-100',
  'border-teal-300/25 bg-teal-300/[0.06] text-teal-100',
]

// djb2 风格哈希：保证同一 tag 在所有卡片上稳定映射到同一色
function pickTagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0
  }
  return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length]
}

export const TrackInsightCard = ({ item }: TrackInsightCardProps) => {
  const highlights = pickKeyNumberHighlights(item.key_numbers, 3)
  const stancePill = item.stance?.trim() ?? null
  const displayedTags = item.tags.slice(0, 3)
  const theme = resolveStanceTheme(stancePill)
  const publishedAt = formatPublishedAt(item.published_at)

  return (
    <Link
      href={`/library/tracks/${encodeURIComponent(item.slug)}`}
      className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-hairline-strong sm:gap-5 sm:rounded-[22px] sm:p-6 ${theme.hoverShadow}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r ${theme.bar} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${theme.orb} opacity-[0.18] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.34]`}
      />

      <div className="relative flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-hairline bg-canvas/60 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">
          TRACK
        </span>
        {stancePill && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium ${theme.pill}`}
          >
            <span
              aria-hidden
              className={`inline-block h-1.5 w-1.5 rounded-full ${theme.dot}`}
            />
            {stancePill}
          </span>
        )}
        {item.industry && (
          <span className="text-[11.5px] text-muted">#{item.industry}</span>
        )}
        {item.is_free ? (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-emerald-300">
            免费
          </span>
        ) : (
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-amber-200">
            会员
          </span>
        )}
      </div>

      <h3 className="font-serif-zh relative line-clamp-2 text-[18.5px] font-semibold leading-[1.3] tracking-tight text-ink sm:text-[20px]">
        {item.track_keyword}
      </h3>

      {item.stance_summary && (
        <p className="relative line-clamp-3 text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">
          {item.stance_summary}
        </p>
      )}

      {highlights.length > 0 && (
        <ul className="relative grid grid-cols-3 gap-2">
          {highlights.map((highlight) => (
            <li
              key={highlight.key}
              className="rounded-lg border border-hairline bg-canvas/50 px-2.5 py-2.5 transition-colors duration-300 group-hover:border-hairline-strong group-hover:bg-canvas/70"
            >
              <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                {highlight.label}
              </div>
              <div
                className={`tabular font-serif-zh mt-1.5 line-clamp-1 text-[15.5px] font-semibold leading-[1.15] ${theme.accent}`}
              >
                {highlight.display}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="relative flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-[11.5px]">
        <span
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 ${REGION_CHIP}`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            className="h-3 w-3 opacity-80"
          >
            <path d="M8 1.6a4.4 4.4 0 014.4 4.4c0 3.43-3.95 7.69-4.12 7.87a.4.4 0 01-.56 0C7.55 13.69 3.6 9.43 3.6 6A4.4 4.4 0 018 1.6zm0 5.9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          {item.region}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 ${AUDIENCE_CHIP}`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            className="h-3 w-3 opacity-80"
          >
            <path d="M8 8.4a3 3 0 100-6 3 3 0 000 6zm-5.5 5.6c0-2.5 2.5-4.4 5.5-4.4s5.5 1.9 5.5 4.4v.4H2.5v-.4z" />
          </svg>
          {item.audience}
        </span>
        {displayedTags.map((tag) => (
          <span
            key={tag}
            className={`rounded-md border px-2 py-0.5 ${pickTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-3 text-[11.5px] text-muted">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="tabular inline-flex items-baseline gap-1">
            <span className="text-[13px] font-semibold text-ink">
              {item.report_metas.length}
            </span>
            <span>份子报告</span>
          </span>
          {typeof item.data_sources_count === 'number' ? (
            <>
              <span aria-hidden className="text-muted/50">
                ·
              </span>
              <span className="tabular inline-flex items-baseline gap-1">
                <span className="text-[13px] font-semibold text-ink">
                  {item.data_sources_count}
                </span>
                <span>数据源</span>
              </span>
            </>
          ) : publishedAt ? (
            <>
              <span aria-hidden className="text-muted/50">
                ·
              </span>
              <span className="tabular">{publishedAt}</span>
            </>
          ) : null}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 font-medium text-ink-soft transition-all duration-300 group-hover:gap-1.5 group-hover:text-ink">
          查看
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden
            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

function formatPublishedAt(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}
