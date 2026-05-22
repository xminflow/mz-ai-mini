'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { TrackInsightCard } from './TrackInsightCard'
import type {
  TrackAnalysisListItem,
  TrackAnalysisListResult,
} from '@/types/track-analysis'

interface TrackCardStreamProps {
  initialItems: TrackAnalysisListItem[]
  initialCursor: string | null
  industry?: string
  stance?: string
  keyword?: string
  pageSize?: number
  emptyMessage: string
}

interface ApiErrorEnvelope {
  error?: { code?: string; message?: string }
}

export function TrackCardStream({
  initialItems,
  initialCursor,
  industry,
  stance,
  keyword,
  pageSize = 24,
  emptyMessage,
}: TrackCardStreamProps) {
  const [items, setItems] = useState<TrackAnalysisListItem[]>(initialItems)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const requestSeq = useRef(0)

  useEffect(() => {
    setItems(initialItems)
    setCursor(initialCursor)
    setError(null)
    setLoading(false)
    requestSeq.current += 1
  }, [initialItems, initialCursor])

  const fetchMore = useCallback(async () => {
    if (loading || !cursor) return
    const seq = ++requestSeq.current
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('cursor', cursor)
      params.set('limit', String(pageSize))
      if (industry) params.set('industry', industry)
      if (stance) params.set('stance', stance)
      if (keyword) params.set('keyword', keyword)

      const response = await fetch(`/api/tracks/list?${params.toString()}`, {
        credentials: 'same-origin',
      })
      const payload = (await response.json().catch(() => ({}))) as
        | TrackAnalysisListResult
        | ApiErrorEnvelope
      if (!response.ok) {
        const message =
          (payload as ApiErrorEnvelope).error?.message ?? '加载更多赛道失败'
        throw new Error(message)
      }
      if (seq !== requestSeq.current) return
      const result = payload as TrackAnalysisListResult
      setItems((prev) => mergeUnique(prev, result.items))
      setCursor(result.next_cursor)
    } catch (caught) {
      if (seq !== requestSeq.current) return
      setError(caught instanceof Error ? caught.message : '加载更多赛道失败')
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }, [cursor, industry, keyword, loading, pageSize, stance])

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
            <TrackInsightCard item={item} />
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
            <span>加载更多赛道…</span>
          ) : (
            <span>滚动加载更多</span>
          )}
        </div>
      ) : items.length > pageSize ? (
        <div className="mt-6 flex h-12 items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.28em] text-muted">
          已加载全部赛道
        </div>
      ) : null}
    </>
  )
}

function mergeUnique(
  prev: TrackAnalysisListItem[],
  next: TrackAnalysisListItem[],
): TrackAnalysisListItem[] {
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
