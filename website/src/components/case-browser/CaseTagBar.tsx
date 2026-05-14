interface CaseTagBarProps {
  tags: string[]
  selectedTags: Set<string>
  onToggle: (tag: string) => void
  onClearAll: () => void
}

export const CaseTagBar = ({ tags, selectedTags, onToggle, onClearAll }: CaseTagBarProps) => {
  if (tags.length === 0) return null

  const hasSelection = selectedTags.size > 0

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto">
      <button
        type="button"
        onClick={onClearAll}
        className={`flex-none rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          hasSelection
            ? 'border border-hairline bg-transparent text-ink-soft hover:border-hairline-strong'
            : 'border border-accent/40 bg-accent/15 text-accent'
        }`}
      >
        全部
      </button>
      {tags.map((tag) => {
        const isSelected = selectedTags.has(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`flex-none rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? 'border border-accent/40 bg-accent/15 text-accent'
                : 'border border-hairline bg-transparent text-ink-soft hover:border-hairline-strong'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
