interface KeywordSearchProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export const KeywordSearch = ({ value, placeholder, onChange }: KeywordSearchProps) => {
  return (
    <label className="flex w-full max-w-md items-center gap-2 rounded-full border border-hairline bg-surface/60 px-4 py-2 text-[13px] backdrop-blur transition-colors focus-within:border-hairline-strong focus-within:bg-surface focus-within:shadow-[0_0_0_4px_rgba(167,139,250,0.12)] sm:px-5 sm:py-2.5 sm:text-sm">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-4 w-4 flex-none text-muted"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9 3.5a5.5 5.5 0 103.358 9.858l3.642 3.642a.75.75 0 101.06-1.06l-3.642-3.642A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder ?? '搜索关键词'}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-ink placeholder:text-muted focus:outline-none"
      />
    </label>
  )
}
