'use client'

import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { FilingLink } from './FilingLink'

export const LightFooter = () => {
  const { copy } = useSiteLocale()
  const year = new Date().getFullYear()

  // 页脚压在最后一屏内容之上，是天然的浮层位置。原来的 border-t 去掉，
  // 改由 glass-medium 的描边承担；左右下三边用内联样式压掉——同为 utility 的
  // border-x-0 与 glass-medium 处在同一层，覆盖顺序不可靠
  return (
    <footer className="glass-medium" style={{ borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0 }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo/weiyu-logo-web-dark.svg" alt={copy.brand} className="h-8 w-8" />
            <span className="text-[14px] font-semibold tracking-tight text-graphite">{copy.brand}</span>
          </div>
          <span className="inline-flex items-center gap-2 text-[12px] text-graphite-dim">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red" />
            {copy.availability}
          </span>
        </div>

        <div className="flex flex-col gap-2 border-t border-rule pt-4 text-[12px] text-graphite-dim sm:flex-row sm:items-center sm:gap-5">
          <span>© {year} {copy.brand}</span>
          <FilingLink className="transition-colors hover:text-graphite" />
        </div>
      </div>
    </footer>
  )
}
