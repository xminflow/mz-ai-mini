import type { MouseEvent } from 'react'
import { useCallback } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import type { Story } from '../../types'
import { StoryTags } from './StoryTags'

interface StoryCardProps {
  story: Story
}

export const StoryCard = ({ story }: StoryCardProps) => {
  const hasCover = story.coverImage !== ''
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const target = event.currentTarget
      const rect = target.getBoundingClientRect()
      mouseX.set(((event.clientX - rect.left) / rect.width) * 100)
      mouseY.set(((event.clientY - rect.top) / rect.height) * 100)
    },
    [mouseX, mouseY],
  )

  const glowBackground = useMotionTemplate`radial-gradient(320px circle at ${mouseX}% ${mouseY}%, rgba(167,139,250,0.22), transparent 60%)`

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-hairline bg-surface/60 backdrop-blur-xl transition-colors duration-500 hover:border-hairline-strong"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: glowBackground }}
      />
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2/60">
        {hasCover ? (
          <img
            src={story.coverImage}
            alt={story.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, rgba(167,139,250,0.25), transparent 55%), radial-gradient(circle at 70% 80%, rgba(34,211,238,0.2), transparent 55%)',
              }}
            />
            <span className="relative text-sm text-muted">暂无封面</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas/70 px-3 py-1 text-[11px] font-medium tracking-wider text-ink-soft backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          待上线
        </span>
      </div>
      <div className="relative flex flex-1 flex-col gap-3 p-5">
        {story.metaItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            {story.metaItems.map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
                {index > 0 && <span className="h-1 w-1 rounded-full bg-muted/60" aria-hidden />}
                {item}
              </span>
            ))}
          </div>
        )}
        <h3 className="text-lg font-semibold leading-snug text-ink">{story.title}</h3>
        {story.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{story.summary}</p>
        )}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <StoryTags tags={story.tags} />
          {story.resultText && (
            <p className="text-xs font-medium text-ink-soft">{story.resultText}</p>
          )}
          {(story.publishedAtText || story.readTimeText) && (
            <div className="flex items-center gap-3 border-t border-hairline pt-3 text-xs text-muted">
              {story.publishedAtText && <span>{story.publishedAtText}</span>}
              {story.readTimeText && <span>· {story.readTimeText}</span>}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}
