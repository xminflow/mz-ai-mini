'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuroraBackground, GradientText, Reveal } from '../motion'
import { LibraryFilterBar } from './LibraryFilterBar'
import { LibraryItemCard } from './LibraryItemCard'
import { LIBRARY_TYPES, type LibraryItem, type LibraryType } from '@/types/library'

interface LibraryListProps {
  initialItems: LibraryItem[]
  platforms: string[]
  industries: string[]
}

const TYPES_SET = new Set<string>([
  LIBRARY_TYPES.BREAKDOWN,
  LIBRARY_TYPES.BLOGGER,
  LIBRARY_TYPES.TRACK,
  LIBRARY_TYPES.PLAYBOOK,
])

const parseType = (value: string | null): LibraryType | 'all' => {
  if (value && TYPES_SET.has(value)) return value as LibraryType
  return 'all'
}

export const LibraryList = ({ initialItems, platforms, industries }: LibraryListProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [activeType, setActiveType] = useState<LibraryType | 'all'>(() =>
    parseType(searchParams.get('type')),
  )
  const [activePlatform, setActivePlatform] = useState<string>('')
  const [activeIndustry, setActiveIndustry] = useState<string>('')
  const [keyword, setKeyword] = useState<string>('')
  const [visibleCount, setVisibleCount] = useState<number>(12)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // 同步 URL ?type=xxx；playbook 直接重定向到独立书站
  useEffect(() => {
    const fromUrl = parseType(searchParams.get('type'))
    if (fromUrl === LIBRARY_TYPES.PLAYBOOK) {
      router.replace('/playbook')
      return
    }
    if (fromUrl !== activeType) setActiveType(fromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const updateType = (next: LibraryType | 'all') => {
    if (next === LIBRARY_TYPES.PLAYBOOK) {
      router.push('/playbook')
      return
    }
    setActiveType(next)
    setVisibleCount(12)
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'all') params.delete('type')
    else params.set('type', next)
    const qs = params.toString()
    router.replace(qs ? `/library?${qs}` : '/library', { scroll: false })
  }

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return initialItems.filter((item) => {
      if (activeType !== 'all' && item.type !== activeType) return false
      if (activePlatform && !item.platforms.includes(activePlatform)) return false
      if (activeIndustry && !item.industries.includes(activeIndustry)) return false
      if (kw) {
        const haystack = [item.title, item.summary, ...item.tags].join(' ').toLowerCase()
        if (!haystack.includes(kw)) return false
      }
      return true
    })
  }, [initialItems, activeType, activePlatform, activeIndustry, keyword])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  useEffect(() => {
    if (!hasMore) return
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => c + 12)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, visibleCount, filtered.length])

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <AuroraBackground variant="subtle" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-16 sm:px-6 sm:pb-12 sm:pt-20">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              信息库 · CONTENT LIBRARY
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh max-w-3xl text-balance text-[28px] font-semibold leading-[1.35] tracking-[0.01em] sm:text-[38px] sm:leading-[1.3] lg:text-[46px] lg:leading-[1.25]">
              把别人验证过的东西，
              <GradientText className="font-semibold">拆给你看</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="max-w-2xl text-[14px] leading-[1.9] text-ink-soft sm:text-[15px]">
              拆解 · 博主 · 赛道 · 手册——可读、可搜、可导航。每一条都按统一结构整理，方便复用与延伸。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="sticky top-14 z-20 -mx-4 border-y border-hairline bg-canvas/85 px-4 py-4 backdrop-blur-xl sm:top-16 sm:-mx-6 sm:px-6 sm:py-5">
          <LibraryFilterBar
            activeType={activeType}
            platforms={platforms}
            industries={industries}
            activePlatform={activePlatform}
            activeIndustry={activeIndustry}
            keyword={keyword}
            onTypeChange={updateType}
            onPlatformChange={(p) => {
              setActivePlatform(p)
              setVisibleCount(12)
            }}
            onIndustryChange={(i) => {
              setActiveIndustry(i)
              setVisibleCount(12)
            }}
            onKeywordChange={(k) => {
              setKeyword(k)
              setVisibleCount(12)
            }}
          />
        </div>

        <div className="mt-8 flex items-center justify-between text-[12px] text-muted sm:text-[12.5px]">
          <span>共 {filtered.length} 条结果</span>
          {(activePlatform || activeIndustry || keyword) && (
            <button
              type="button"
              onClick={() => {
                setActivePlatform('')
                setActiveIndustry('')
                setKeyword('')
              }}
              className="rounded-full border border-hairline px-3 py-1 transition-colors hover:border-hairline-strong hover:text-ink"
            >
              清除筛选
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hairline bg-surface/30 px-6 py-16 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              No Result
            </span>
            <p className="text-[13.5px] text-ink-soft sm:text-[14px]">
              当前筛选条件下暂无内容。试着切换分类，或者清除筛选。
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <LibraryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {hasMore && (
          <div ref={sentinelRef} className="mt-10 flex justify-center text-[12px] text-muted">
            <span>加载更多…</span>
          </div>
        )}
      </section>
    </div>
  )
}
