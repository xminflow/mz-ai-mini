interface StoryTagsProps {
  tags: string[]
}

export const StoryTags = ({ tags }: StoryTagsProps) => {
  if (tags.length === 0) {
    return null
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="inline-flex items-center rounded-full border border-hairline bg-canvas/60 px-3 py-1 text-xs font-medium text-ink-soft"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}
