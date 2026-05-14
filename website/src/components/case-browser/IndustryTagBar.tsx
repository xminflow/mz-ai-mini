interface IndustryTagBarProps {
  industries: string[]
  selected: string
  onChange: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export const IndustryTagBar = ({
  industries,
  selected,
  onChange,
  orientation = 'horizontal',
}: IndustryTagBarProps) => {
  if (industries.length === 0) return null

  const containerClass =
    orientation === 'vertical'
      ? 'flex flex-col gap-2'
      : 'scrollbar-hide flex gap-2 overflow-x-auto'
  const itemBase =
    orientation === 'vertical'
      ? 'w-full rounded-full px-3 py-1 text-left text-sm font-medium transition-colors'
      : 'flex-none rounded-full px-3 py-1 text-sm font-medium transition-colors'

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={() => onChange('')}
        className={`${itemBase} ${
          selected === ''
            ? 'border border-accent/40 bg-accent/15 text-accent'
            : 'border border-hairline bg-transparent text-ink-soft hover:border-hairline-strong'
        }`}
      >
        全部
      </button>
      {industries.map((industry) => (
        <button
          key={industry}
          type="button"
          onClick={() => onChange(selected === industry ? '' : industry)}
          className={`${itemBase} ${
            selected === industry
              ? 'border border-accent/40 bg-accent/15 text-accent'
              : 'border border-hairline bg-transparent text-ink-soft hover:border-hairline-strong'
          }`}
        >
          {industry}
        </button>
      ))}
    </div>
  )
}
