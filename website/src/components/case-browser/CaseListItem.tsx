'use client'

import { motion } from 'framer-motion'
import type { Story } from '../../types'

interface CaseListItemProps {
  story: Story
  isActive: boolean
  onClick: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const CaseListItem = ({
  story,
  isActive,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: CaseListItemProps) => {
  const hasCover = story.coverImage !== ''

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`group relative flex w-full gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
        isActive
          ? 'bg-surface-2/60'
          : 'hover:bg-surface/60'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="case-active-indicator"
          className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-surface-2/60">
        {hasCover ? (
          <img
            src={story.coverImage}
            alt={story.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, rgba(167,139,250,0.3), transparent 60%), radial-gradient(circle at 70% 80%, rgba(34,211,238,0.25), transparent 60%)',
            }}
          >
            <span className="text-[10px] text-muted">报告</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="truncate text-sm font-medium text-ink">{story.title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted md:line-clamp-2 max-md:hidden">
          {story.summary}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {story.industry && (
            <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              {story.industry}
            </span>
          )}
          {story.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-hairline px-2 py-0.5 text-[10px] text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}
