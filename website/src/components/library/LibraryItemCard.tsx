import Link from 'next/link'
import { LIBRARY_TYPE_LABELS, type LibraryItem } from '@/types/library'

interface LibraryItemCardProps {
  item: LibraryItem
}

export const LibraryItemCard = ({ item }: LibraryItemCardProps) => {
  return (
    <Link
      href={`/library/${item.id}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-hairline bg-canvas/60 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            {LIBRARY_TYPE_LABELS[item.type]}
          </span>
          {item.platforms[0] && (
            <span className="text-[11.5px] text-muted">#{item.platforms[0]}</span>
          )}
          {item.industries[0] && (
            <span className="text-[11.5px] text-muted">#{item.industries[0]}</span>
          )}
        </div>
        {item.coverEmoji && (
          <span className="text-[20px] opacity-80 sm:text-[22px]" aria-hidden>
            {item.coverEmoji}
          </span>
        )}
      </div>

      <h3 className="font-serif-zh text-[16px] font-semibold leading-[1.5] text-ink transition-colors group-hover:text-ink sm:text-[17px]">
        {item.title}
      </h3>

      <p className="line-clamp-3 text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">
        {item.summary}
      </p>

      <TypeSpecificMeta item={item} />

      <div className="mt-auto flex items-center justify-between border-t border-hairline pt-3 text-[11.5px] text-muted">
        <span>{item.publishedAt}</span>
        <span>{item.readTime} 分钟阅读</span>
      </div>
    </Link>
  )
}

const TypeSpecificMeta = ({ item }: { item: LibraryItem }) => {
  if (item.type === 'breakdown') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
        {item.hint?.interactions && (
          <span className="rounded-md bg-canvas/60 px-2 py-0.5">{item.hint.interactions}</span>
        )}
        {item.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-md border border-hairline px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>
    )
  }
  if (item.type === 'blogger') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
        {item.hint?.fanCount && (
          <span className="rounded-md bg-canvas/60 px-2 py-0.5">{item.hint.fanCount}</span>
        )}
        {typeof item.hint?.matrixCount === 'number' && (
          <span className="rounded-md border border-hairline px-2 py-0.5">
            矩阵 {item.hint.matrixCount} 号
          </span>
        )}
      </div>
    )
  }
  if (item.type === 'track') {
    return (
      <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
        {item.hint?.keyDataPoints?.slice(0, 3).map((dp) => (
          <span key={dp} className="rounded-md border border-hairline px-2 py-0.5">
            {dp}
          </span>
        ))}
      </div>
    )
  }
  // playbook
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
      {item.hint?.difficulty && (
        <span className="rounded-md bg-canvas/60 px-2 py-0.5">{item.hint.difficulty}</span>
      )}
      {item.hint?.hasDownload && (
        <span className="rounded-md border border-hairline px-2 py-0.5">含附件</span>
      )}
    </div>
  )
}
