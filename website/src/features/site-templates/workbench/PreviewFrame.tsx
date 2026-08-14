'use client'

import { useState } from 'react'

const VIEWPORTS = [
  { id: 'desktop', label: '桌面', width: 1440 },
  { id: 'tablet', label: '平板', width: 834 },
  { id: 'mobile', label: '手机', width: 390 },
] as const

type ViewportId = (typeof VIEWPORTS)[number]['id']

export function PreviewFrame({ src, title }: { src: string; title: string }) {
  const [viewport, setViewport] = useState<ViewportId>('desktop')
  const active = VIEWPORTS.find((item) => item.id === viewport) ?? VIEWPORTS[0]

  return (
    <div>
      <div className="flex items-center gap-6 border-b border-white/10 pb-3">
        {VIEWPORTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setViewport(item.id)}
            aria-pressed={item.id === viewport}
            className={
              item.id === viewport
                ? 'text-sm text-neutral-100'
                : 'text-sm text-neutral-500 transition hover:text-neutral-300'
            }
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-neutral-600">{active.width}px</span>
      </div>

      {/* 切视口是真的改 iframe 宽度，不是 CSS 缩放：只有真实宽度才会触发模板内部的响应式断点，
          缩放方案看着像但验证不出任何东西。
          外层 overflow-x-auto：桌面档在窄屏下横向滚动查看，而不是把 iframe 压窄导致失真。 */}
      <div className="mt-6 overflow-x-auto pb-4">
        <iframe
          src={src}
          title={title}
          style={{ width: active.width }}
          className="h-[760px] max-w-none border-0"
        />
      </div>
    </div>
  )
}
