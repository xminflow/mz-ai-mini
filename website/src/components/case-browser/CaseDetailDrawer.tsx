'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { Story, StoryDetail } from '../../types'
import { CaseDetailPanel } from './CaseDetailPanel'

interface CaseDetailDrawerProps {
  open: boolean
  story: Story | undefined
  detail: StoryDetail | null
  detailLoading: boolean
  detailError: string
  onClose: () => void
}

export const CaseDetailDrawer = ({
  open,
  story,
  detail,
  detailLoading,
  detailError,
  onClose,
}: CaseDetailDrawerProps) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          key="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-canvas/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          key="drawer-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-2xl border-t border-hairline bg-surface"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="mx-auto h-1 w-8 rounded-full bg-hairline-strong" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface/80 text-muted transition-colors hover:text-ink"
            aria-label="关闭"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
            </svg>
          </button>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <CaseDetailPanel
              story={story}
              detail={detail}
              loading={detailLoading}
              error={detailError}
            />
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
)
