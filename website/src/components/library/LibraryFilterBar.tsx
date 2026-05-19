'use client'

import { LIBRARY_TYPES, LIBRARY_TYPE_LABELS, type LibraryType } from '@/types/library'

interface LibraryFilterBarProps {
  activeType: LibraryType | 'all'
  platforms: string[]
  industries: string[]
  activePlatform: string
  activeIndustry: string
  keyword: string
  onTypeChange: (type: LibraryType | 'all') => void
  onPlatformChange: (platform: string) => void
  onIndustryChange: (industry: string) => void
  onKeywordChange: (keyword: string) => void
}

const TYPES: Array<LibraryType | 'all'> = [
  'all',
  LIBRARY_TYPES.BREAKDOWN,
  LIBRARY_TYPES.BLOGGER,
  LIBRARY_TYPES.TRACK,
  LIBRARY_TYPES.PLAYBOOK,
]

const labelFor = (t: LibraryType | 'all') => (t === 'all' ? '全部' : LIBRARY_TYPE_LABELS[t])

export const LibraryFilterBar = ({
  activeType,
  platforms,
  industries,
  activePlatform,
  activeIndustry,
  keyword,
  onTypeChange,
  onPlatformChange,
  onIndustryChange,
  onKeywordChange,
}: LibraryFilterBarProps) => {
  // 二级筛选：手册 & 全部不展示「平台/行业」（手册大多无平台/行业）
  const showSecondary = activeType !== LIBRARY_TYPES.PLAYBOOK

  return (
    <div className="flex flex-col gap-4">
      {/* 一级 type tab */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => {
          const active = activeType === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => onTypeChange(t)}
              className={[
                'rounded-full border px-3.5 py-1.5 text-[12.5px] transition-all sm:text-[13px]',
                active
                  ? 'border-hairline-strong bg-surface/80 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'border-hairline bg-surface/40 text-muted hover:border-hairline-strong hover:text-ink',
              ].join(' ')}
            >
              {labelFor(t)}
            </button>
          )
        })}
      </div>

      {/* 二级筛选条 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-muted" fill="currentColor">
            <path d="M7 2a5 5 0 013.9 8.13l3.49 3.48a.75.75 0 11-1.06 1.06l-3.49-3.48A5 5 0 117 2zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
          </svg>
          <input
            type="search"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="搜索标题、标签…"
            className="w-44 bg-transparent text-[12.5px] text-ink placeholder:text-muted focus:outline-none sm:w-56 sm:text-[13px]"
          />
        </div>

        {showSecondary && (
          <>
            <FilterSelect
              label="平台"
              value={activePlatform}
              options={['', ...platforms]}
              renderLabel={(v) => (v === '' ? '全部平台' : v)}
              onChange={onPlatformChange}
            />
            <FilterSelect
              label="行业"
              value={activeIndustry}
              options={['', ...industries]}
              renderLabel={(v) => (v === '' ? '全部行业' : v)}
              onChange={onIndustryChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  renderLabel: (v: string) => string
  onChange: (v: string) => void
}

const FilterSelect = ({ value, options, renderLabel, onChange }: FilterSelectProps) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 pr-8 text-[12.5px] text-ink focus:border-hairline-strong focus:outline-none sm:text-[13px]"
    >
      {options.map((opt) => (
        <option key={opt || 'all'} value={opt}>
          {renderLabel(opt)}
        </option>
      ))}
    </select>
    <svg
      viewBox="0 0 12 12"
      className="pointer-events-none absolute right-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted"
      fill="currentColor"
    >
      <path d="M2.5 4.25a.6.6 0 01.85 0L6 6.9l2.65-2.65a.6.6 0 11.85.85l-3.08 3.08a.6.6 0 01-.85 0L2.5 5.1a.6.6 0 010-.85z" />
    </svg>
  </div>
)
