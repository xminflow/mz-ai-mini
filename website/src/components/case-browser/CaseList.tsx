'use client'

import { motion } from 'framer-motion'
import type { Story } from '../../types'
import { CaseListItem } from './CaseListItem'

interface CaseListProps {
  items: Story[]
  selectedCaseId: string | null
  onSelect: (caseId: string) => void
  onPrefetch: (caseId: string) => void
  onCancelPrefetch: () => void
  emptyText: string
}

export const CaseList = ({
  items,
  selectedCaseId,
  onSelect,
  onPrefetch,
  onCancelPrefetch,
  emptyText,
}: CaseListProps) => {
  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted">
        {emptyText}
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.04, delayChildren: 0.03 },
        },
      }}
      className="flex flex-col divide-y divide-hairline"
    >
      {items.map((story) => (
        <motion.div
          key={story.id || story.title}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <CaseListItem
            story={story}
            isActive={story.id === selectedCaseId}
            onClick={() => onSelect(story.id)}
            onMouseEnter={() => onPrefetch(story.id)}
            onMouseLeave={onCancelPrefetch}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
