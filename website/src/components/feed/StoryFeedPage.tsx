import { motion } from 'framer-motion'
import { useStoryFeed } from '../../hooks'
import type { StoryType } from '../../types'
import { AuroraBackground, GradientText } from '../motion'
import { FeedGrid } from './FeedGrid'
import { IndustryDropdown } from './IndustryDropdown'
import { KeywordSearch } from './KeywordSearch'
import { LoadMoreSentinel } from './LoadMoreSentinel'

interface StoryFeedPageProps {
  type?: StoryType
  pageTitle: string
  pageDescription: string
  searchPlaceholder: string
  emptyText: string
}

export const StoryFeedPage = ({
  type,
  pageTitle,
  pageDescription,
  searchPlaceholder,
  emptyText,
}: StoryFeedPageProps) => {
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    keyword,
    setKeyword,
    industry,
    setIndustry,
    availableIndustries,
    loadMore,
    reload,
  } = useStoryFeed(type)

  const showEmpty = !loading && !error && items.length === 0
  const showError = !loading && error !== ''

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <AuroraBackground variant="subtle" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 sm:gap-5"
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              创业机会分析 · 市场调研
            </span>
            <h1 className="font-serif-zh max-w-3xl text-balance text-[34px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-[48px] sm:leading-[1.3] lg:text-[60px] lg:leading-[1.25]">
              {pageTitle}
              <GradientText className="ml-2 font-semibold sm:ml-3">.</GradientText>
            </h1>
            <p className="max-w-2xl text-sm leading-[1.85] text-ink-soft sm:text-[15px]">{pageDescription}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between"
          >
            <KeywordSearch value={keyword} placeholder={searchPlaceholder} onChange={setKeyword} />
            {availableIndustries.length > 0 && (
              <IndustryDropdown value={industry} options={availableIndustries} onChange={setIndustry} />
            )}
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10">
        {loading && <FeedSkeleton />}

        {showError && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-hairline bg-surface/60 p-12 text-center backdrop-blur-xl">
            <p className="text-sm text-muted">加载失败：{error}</p>
            <button
              type="button"
              onClick={reload}
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-canvas transition-transform hover:-translate-y-0.5"
            >
              重新加载
            </button>
          </div>
        )}

        {showEmpty && (
          <div className="rounded-3xl border border-hairline bg-surface/60 p-12 text-center text-sm text-muted backdrop-blur-xl">
            {emptyText}
          </div>
        )}

        {!loading && !showError && items.length > 0 && (
          <>
            <FeedGrid items={items} />
            <LoadMoreSentinel onReach={loadMore} disabled={!hasMore || loadingMore} />
            <div className="pt-6 text-center text-xs text-muted">
              {loadingMore && '加载中…'}
              {!loadingMore && !hasMore && '· 已经到底了 ·'}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

const FeedSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="flex h-72 flex-col overflow-hidden rounded-2xl border border-hairline bg-surface/40 backdrop-blur sm:h-80 sm:rounded-3xl"
      >
        <div className="aspect-[16/10] w-full animate-pulse bg-surface-2/60" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-surface-2/70" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-surface-2/70" />
          <div className="h-3 w-full animate-pulse rounded bg-surface-2/60" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-surface-2/60" />
        </div>
      </div>
    ))}
  </div>
)
