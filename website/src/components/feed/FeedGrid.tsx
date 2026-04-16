import { motion } from 'framer-motion'
import type { Story } from '../../types'
import { StoryCard } from '../story-card'

interface FeedGridProps {
  items: Story[]
}

export const FeedGrid = ({ items }: FeedGridProps) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.06, delayChildren: 0.05 },
        },
      }}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {items.map((story) => (
        <motion.div
          key={story.id || story.title}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          <StoryCard story={story} />
        </motion.div>
      ))}
    </motion.div>
  )
}
