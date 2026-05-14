'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useCaseBrowser } from '../../hooks'
import type { StoryListResult } from '../../types'
import { KeywordSearch } from '../feed/KeywordSearch'
import { CaseDetailDrawer } from './CaseDetailDrawer'
import { CaseDetailPanel } from './CaseDetailPanel'
import { CaseList } from './CaseList'
import { IndustryTagBar } from './IndustryTagBar'

interface CaseBrowserLayoutProps {
  initialData?: StoryListResult
}

const ListSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-3 rounded-xl border border-hairline bg-surface/40 p-3"
      >
        <div className="h-12 w-12 flex-none animate-pulse rounded-lg bg-surface-2/60" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2/70" />
          <div className="h-3 w-full animate-pulse rounded bg-surface-2/60" />
          <div className="flex gap-1.5">
            <div className="h-4 w-10 animate-pulse rounded-full bg-surface-2/60" />
            <div className="h-4 w-12 animate-pulse rounded-full bg-surface-2/60" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

export const CaseBrowserLayout = ({ initialData }: CaseBrowserLayoutProps) => {
  const {
    items,
    loading,
    error,
    keyword,
    setKeyword,
    industry,
    setIndustry,
    availableIndustries,
    selectedCaseId,
    selectCase,
    selectedDetail,
    detailLoading,
    detailError,
    prefetchDetail,
    cancelPrefetch,
    reload,
  } = useCaseBrowser({ initialData })

  const [drawerOpen, setDrawerOpen] = useState(false)

  const selectedStory = useMemo(
    () => items.find((item) => item.id === selectedCaseId),
    [items, selectedCaseId],
  )

  const handleSelectDesktop = useCallback(
    (caseId: string) => {
      selectCase(caseId)
    },
    [selectCase],
  )

  const handleSelectMobile = useCallback(
    (caseId: string) => {
      selectCase(caseId)
      setDrawerOpen(true)
    },
    [selectCase],
  )

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const showError = !loading && error !== ''

  return (
    <div className="relative">
      {/* Error */}
      {showError && (
        <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-hairline bg-surface/60 p-8 text-center backdrop-blur-xl">
            <p className="text-sm text-muted">加载失败：{error}</p>
            <button
              type="button"
              onClick={reload}
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-canvas transition-transform hover:-translate-y-0.5"
            >
              重新加载
            </button>
          </div>
        </section>
      )}

      {/* Desktop: three-panel layout (>= md) */}
      <section className="relative mx-auto hidden w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 md:flex">
        {/* Left panel: case list */}
        <div className="flex w-[240px] flex-none flex-col lg:w-[280px]">
          <div className="scrollbar-thin -mr-2 flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            {loading ? (
              <ListSkeleton />
            ) : (
              <CaseList
                items={items}
                selectedCaseId={selectedCaseId}
                onSelect={handleSelectDesktop}
                onPrefetch={prefetchDetail}
                onCancelPrefetch={cancelPrefetch}
                emptyText="暂无符合条件的报告，试试调整筛选条件。"
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="ml-6 w-px self-stretch bg-hairline lg:ml-8" />

        {/* Middle panel: detail */}
        <div className="ml-6 flex-1 overflow-hidden lg:ml-8">
          <div className="scrollbar-thin h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            <CaseDetailPanel
              story={selectedStory}
              detail={selectedDetail}
              loading={detailLoading}
              error={detailError}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="ml-6 w-px self-stretch bg-hairline lg:ml-8" />

        {/* Right panel: filters (sticky vertical) */}
        <aside className="ml-6 w-[160px] flex-none lg:ml-8 lg:w-[180px]">
          <div
            className="sticky flex flex-col gap-4 top-20 sm:top-24"
          >
            <KeywordSearch value={keyword} placeholder="搜索关键词" onChange={setKeyword} />
            {availableIndustries.length > 0 && (
              <IndustryTagBar
                industries={availableIndustries}
                selected={industry}
                onChange={setIndustry}
                orientation="vertical"
              />
            )}
          </div>
        </aside>
      </section>

      {/* Mobile: horizontal filters + single column + drawer (< md) */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 md:hidden">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 flex flex-col gap-3"
        >
          {availableIndustries.length > 0 && (
            <IndustryTagBar
              industries={availableIndustries}
              selected={industry}
              onChange={setIndustry}
            />
          )}
          <KeywordSearch value={keyword} placeholder="搜索行业报告关键词" onChange={setKeyword} />
        </motion.div>

        {loading ? (
          <ListSkeleton />
        ) : (
          <CaseList
            items={items}
            selectedCaseId={selectedCaseId}
            onSelect={handleSelectMobile}
            onPrefetch={prefetchDetail}
            onCancelPrefetch={cancelPrefetch}
            emptyText="暂无符合条件的报告，试试调整筛选条件。"
          />
        )}

        <CaseDetailDrawer
          open={drawerOpen}
          story={selectedStory}
          detail={selectedDetail}
          detailLoading={detailLoading}
          detailError={detailError}
          onClose={handleCloseDrawer}
        />
      </section>
    </div>
  )
}
