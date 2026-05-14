'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { Story, StoryDetail, StoryReportSection } from '../../types'
import { StoryTags } from '../story-card'
import { CaseDetailSkeleton } from './CaseDetailSkeleton'
import { MarkdownRenderer } from './MarkdownRenderer'
import { ReportQrCodeModal } from './ReportQrCodeModal'

interface CaseDetailPanelProps {
  story: Story | undefined
  detail: StoryDetail | null
  loading: boolean
  error: string
}

const EmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
    <div
      className="h-16 w-16 rounded-2xl"
      style={{
        background:
          'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.2), transparent 60%), radial-gradient(circle at 70% 70%, rgba(34,211,238,0.15), transparent 60%)',
      }}
    />
    <p className="text-sm text-muted">选择左侧报告查看详情</p>
  </div>
)

interface ReportTabsProps {
  sections: StoryReportSection[]
  activeKey: string
  onChange: (key: string) => void
}

const ReportTabs = ({ sections, activeKey, onChange }: ReportTabsProps) => (
  <div className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="报告章节">
    {sections.map((section) => {
      const active = section.key === activeKey
      return (
        <button
          key={section.key}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(section.key)}
          className={[
            'flex-none rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
            active
              ? 'bg-accent text-white'
              : 'border border-hairline bg-surface/60 text-muted hover:border-hairline-strong hover:text-ink',
          ].join(' ')}
        >
          {section.label}
        </button>
      )
    })}
  </div>
)

export const CaseDetailPanel = ({ story, detail, loading, error }: CaseDetailPanelProps) => {
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState({ detailId: '', key: '' })

  const activeSectionKey = selectedSection.detailId === detail?.id
    ? selectedSection.key
    : detail?.reportSections[0]?.key ?? ''
  const activeSection = useMemo(
    () => detail?.reportSections.find((section) => section.key === activeSectionKey) ?? detail?.reportSections[0],
    [activeSectionKey, detail],
  )

  if (!story) return <EmptyState />

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={story.id}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col"
      >
        {loading && !detail && <CaseDetailSkeleton />}

        {error && !detail && (
          <div className="p-6">
            <p className="text-sm text-muted">加载失败：{error}</p>
          </div>
        )}

        {detail && (
          <div className="p-6">
            <h1 className="text-2xl font-semibold leading-snug text-ink">{detail.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
              {detail.industry && (
                <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {detail.industry}
                </span>
              )}
              {detail.publishedAtText && <span>{detail.publishedAtText}</span>}
              {detail.readTimeText && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted/60" />
                  <span>{detail.readTimeText}</span>
                </>
              )}
            </div>
            {detail.tags.length > 0 && (
              <div className="mt-3">
                <StoryTags tags={detail.tags} />
              </div>
            )}
            <hr className="my-5 border-hairline" />
            {detail.reportSections.length > 0 && (
              <div className="mb-5">
                <ReportTabs
                  sections={detail.reportSections}
                  activeKey={activeSection?.key ?? ''}
                  onChange={(key) => setSelectedSection({ detailId: detail.id, key })}
                />
              </div>
            )}
            {activeSection ? (
              <section aria-labelledby={`report-section-${activeSection.key}`}>
                <h2 id={`report-section-${activeSection.key}`} className="sr-only">
                  {activeSection.title}
                </h2>
                <MarkdownRenderer content={activeSection.content} />
              </section>
            ) : (
              <p className="text-sm text-muted">暂无详情内容。</p>
            )}
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                咨询报告订阅
              </button>
              <p className="text-[11px] text-muted">
                年费订阅看全部报告 · 合作客户免费
              </p>
            </div>
          </div>
        )}
        <ReportQrCodeModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      </motion.div>
    </AnimatePresence>
  )
}
