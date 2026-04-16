interface IndustryDropdownProps {
  value: string
  options: string[]
  onChange: (value: string) => void
}

export const IndustryDropdown = ({ value, options, onChange }: IndustryDropdownProps) => {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-4 py-2 text-[13px] backdrop-blur transition-colors focus-within:border-hairline-strong focus-within:bg-surface sm:px-5 sm:py-2.5 sm:text-sm">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">行业</span>
      <span className="inline-block h-3 w-px bg-hairline" aria-hidden />
      <div className="relative flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="cursor-pointer appearance-none bg-transparent pr-6 text-ink focus:outline-none"
          style={{ colorScheme: 'dark' }}
        >
          <option value="">全部</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-0 h-3.5 w-3.5 text-muted"
          fill="currentColor"
        >
          <path d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
        </svg>
      </div>
    </label>
  )
}
