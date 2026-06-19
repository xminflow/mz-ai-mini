'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { BloggerInsightCard } from './BloggerInsightCard'
import type {
  BloggerInsightListItem,
  BloggerInsightListResult,
} from '@/types/blogger-insight'

interface BloggerCardStreamProps {
  initialItems: BloggerInsightListItem[]
  initialCursor: string | null
  platform?: string
  keyword?: string
  pageSize?: number
  emptyMessage: string
}

interface ApiErrorEnvelope {
  error?: { code?: string; message?: string }
}

// 把首批服务端渲染的卡片接力到客户端，滚动到底部 sentinel 时按需拉取下一页。
// 布局用 CSS columns 实现瀑布流：卡片高度不一时按列贪心填充，比 grid 更省空间，
// 且不需要 client 端测量重排。注意 break-inside-avoid 才能把每张卡片整体留在同列。
export function BloggerCardStream({
  initialItems,
  initialCursor,
  platform,
  keyword,
  pageSize = 24,
  emptyMessage,
}: BloggerCardStreamProps) {
  const [items, setItems] = useState<BloggerInsightListItem[]>(initialItems)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const requestSeq = useRef(0)

  // 当筛选/搜索条件变化导致服务端给出新的首批数据时，重置流式状态。
  // 使用渲染阶段 setState（React 官方推荐的 derived-state 写法），避免在 effect 体内同步 setState。
  const [prevInitial, setPrevInitial] = useState({ items: initialItems, cursor: initialCursor })
  if (prevInitial.items !== initialItems || prevInitial.cursor !== initialCursor) {
    setPrevInitial({ items: initialItems, cursor: initialCursor })
    setItems(initialItems)
    setCursor(initialCursor)
    setError(null)
    setLoading(false)
  }

  // ref 写操作只允许在 effect / 事件处理器中进行；筛选重置后递增序号以丢弃过期异步结果。
  useEffect(() => {
    requestSeq.current += 1
  }, [prevInitial])

  const fetchMore = useCallback(async () => {
    if (loading || !cursor) return
    const seq = ++requestSeq.current
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('cursor', cursor)
      params.set('limit', String(pageSize))
      if (platform) params.set('platform', platform)
      if (keyword) params.set('keyword', keyword)

      const response = await fetch(`/api/bloggers/list?${params.toString()}`, {
        credentials: 'same-origin',
      })
      const payload = (await response.json().catch(() => ({}))) as
        | BloggerInsightListResult
        | ApiErrorEnvelope
      if (!response.ok) {
        const message =
          (payload as ApiErrorEnvelope).error?.message ?? '加载更多博主失败'
        throw new Error(message)
      }
      if (seq !== requestSeq.current) {
        // 已被新的筛选请求顶掉，丢弃过期结果
        return
      }
      const result = payload as BloggerInsightListResult
      setItems((prev) => mergeUnique(prev, result.items))
      setCursor(result.next_cursor)
    } catch (caught) {
      if (seq !== requestSeq.current) return
      setError(caught instanceof Error ? caught.message : '加载更多博主失败')
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }, [cursor, keyword, loading, pageSize, platform])

  useEffect(() => {
    if (!cursor) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          void fetchMore()
        }
      },
      { rootMargin: '320px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [cursor, fetchMore])

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface/60 p-10 text-center text-[13.5px] text-muted">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item) => (
          <div key={item.slug} className="mb-4 break-inside-avoid">
            <BloggerInsightCard item={item} />
          </div>
        ))}
      </div>

      {cursor ? (
        <div
          ref={sentinelRef}
          className="mt-6 flex h-16 items-center justify-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted"
          aria-live="polite"
        >
          {error ? (
            <button
              type="button"
              onClick={() => void fetchMore()}
              className="rounded-full border border-hairline bg-surface/40 px-4 py-1.5 text-[12px] tracking-[0.18em] text-ink transition-colors hover:border-hairline-strong"
            >
              {error} · 点击重试
            </button>
          ) : loading ? (
            <span>加载更多博主…</span>
          ) : (
            <span>滚动加载更多</span>
          )}
        </div>
      ) : items.length > pageSize ? (
        <div className="mt-6 flex h-12 items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.28em] text-muted">
          已加载全部博主
        </div>
      ) : null}
    </>
  )
}

function mergeUnique(
  prev: BloggerInsightListItem[],
  next: BloggerInsightListItem[],
): BloggerInsightListItem[] {
  if (next.length === 0) return prev
  const seen = new Set(prev.map((item) => item.slug))
  const merged = prev.slice()
  for (const item of next) {
    if (seen.has(item.slug)) continue
    seen.add(item.slug)
    merged.push(item)
  }
  return merged
}
