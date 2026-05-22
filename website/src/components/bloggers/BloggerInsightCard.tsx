import Link from 'next/link'

import {
  bloggerPlatformLabel,
  formatBloggerFans,
  type BloggerInsightListItem,
} from '@/types/blogger-insight'

interface BloggerInsightCardProps {
  item: BloggerInsightListItem
}

export const BloggerInsightCard = ({ item }: BloggerInsightCardProps) => {
  const fansLabel = formatBloggerFans(item.fans_count)
  const platformLabel = bloggerPlatformLabel(item.platform)
  const fallbackInitial = item.display_name?.trim().charAt(0) ?? '·'

  return (
    <Link
      href={`/bloggers/${encodeURIComponent(item.slug)}`}
      className="group flex h-full gap-4 rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-hairline-strong sm:gap-5 sm:rounded-[22px] sm:p-6"
    >
      {item.avatar_url ? (
        <img
          src={item.avatar_url}
          alt={`${item.display_name} 头像`}
          className="h-20 w-20 shrink-0 rounded-full border border-hairline object-cover sm:h-[88px] sm:w-[88px]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas/60 font-serif-zh text-[26px] font-semibold text-ink-soft sm:h-[88px] sm:w-[88px] sm:text-[30px]">
          {fallbackInitial}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-hairline bg-canvas/60 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            博主洞察
          </span>
          <span className="text-[11.5px] text-muted">#{platformLabel}</span>
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

        <h3 className="font-serif-zh truncate text-[17px] font-semibold leading-[1.4] text-ink sm:text-[18px]">
          {item.display_name}
        </h3>

        {item.positioning && (
          <p className="line-clamp-2 text-[13px] leading-[1.8] text-muted sm:text-[13.5px]">
            {item.positioning}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
          <span className="rounded-md bg-canvas/60 px-2 py-0.5">{fansLabel}</span>
          {typeof item.total_works_count === 'number' && (
            <span className="rounded-md border border-hairline px-2 py-0.5">
              {item.total_works_count} 作品
            </span>
          )}
          {item.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-md border border-hairline px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-hairline pt-3 text-[11.5px] text-muted">
          <span>{formatPublishedAt(item.published_at)}</span>
          <span>查看分析报告 →</span>
        </div>
      </div>
    </Link>
  )
}

function formatPublishedAt(value: string | null): string {
  if (!value) return '未发布'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未发布'
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}
