'use client'

import { useState } from 'react'

const VIEWPORTS = [
  { id: 'desktop', label: '桌面', width: 1440 },
  { id: 'tablet', label: '平板', width: 834 },
  { id: 'mobile', label: '手机', width: 390 },
] as const

type ViewportId = (typeof VIEWPORTS)[number]['id']

interface PreviewFrameProps {
  src: string
  title: string
  /** 窗口地址栏里显示的示意域名，不是站内真实路径 */
  address: string
  /** 模板自己的强调色，用在选中态上 */
  accentColor: string
}

export function PreviewFrame({ src, title, address, accentColor }: PreviewFrameProps) {
  const [viewport, setViewport] = useState<ViewportId>('desktop')
  const active = VIEWPORTS.find((item) => item.id === viewport) ?? VIEWPORTS[0]

  return (
    <div>
      <div className="flex items-center gap-8 border-b border-rule pb-3">
        {VIEWPORTS.map((item) => {
          const isActive = item.id === viewport
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setViewport(item.id)}
              aria-pressed={isActive}
              className={
                isActive
                  ? 'relative pb-3 text-[14px] text-graphite'
                  : 'relative pb-3 text-[14px] text-graphite-dim transition hover:text-graphite'
              }
            >
              {item.label}
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-[2px]"
                  style={{ backgroundColor: accentColor }}
                />
              ) : null}
            </button>
          )
        })}
        <span className="ml-auto font-mono text-[12px] text-graphite-dim">{active.width}px</span>
      </div>

      {/* 切视口是真的改 iframe 宽度，不是 CSS 缩放：只有真实宽度才会触发模板内部的响应式断点，
          缩放方案看着像但验证不出任何东西。
          外层 overflow-x-auto：桌面档在窄屏下横向滚动查看，而不是把 iframe 压窄导致失真；
          负 margin + padding 是给窗口阴影留出的溢出空间，否则会被滚动容器裁掉。 */}
      <div className="-mx-3 mt-8 overflow-x-auto px-3 pb-12">
        {/* 浏览器窗口拟态。
            存在的理由不是装饰：工作台自己也是一个浅色页面，模板（尤其浅色模板）直接嵌进来
            会和工作台糊成一片，读者分不清哪里是"被预览的那个站"。套一层窗口壳之后，
            边界由标题栏而不是一条细线来表达，一眼就知道框里是另一个独立网站。
            整体仍然只有一层容器，不做卡片套卡片。 */}
        <div
          className="rounded-card inline-block overflow-hidden border border-rule bg-paper-raised align-top shadow-soft-lg"
          style={{ width: active.width }}
        >
          <div className="flex items-center gap-4 border-b border-rule bg-paper px-4 py-3">
            {/* 窗口控制点用中性灰而不是红黄绿：官网只有红/黄/蓝三支彩色，
                在这里塞一组交通灯配色会凭空多出两支不属于色板的颜色。 */}
            <div className="flex shrink-0 gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-rule-strong" />
              <span className="size-2.5 rounded-full bg-rule-strong" />
              <span className="size-2.5 rounded-full bg-rule-strong" />
            </div>

            <div className="rounded-btn flex min-w-0 flex-1 items-center justify-center gap-2 border border-rule bg-paper-raised px-3 py-1.5">
              <svg
                viewBox="0 0 24 24"
                className="size-3 shrink-0 text-graphite-dim"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <span className="truncate font-mono text-[11px] text-graphite-dim">{address}</span>
            </div>

            {/* 与左侧三个控制点等宽的占位，让地址栏在窗口里真正居中 */}
            <span className="w-[42px] shrink-0" aria-hidden />
          </div>

          <iframe src={src} title={title} className="block h-[760px] w-full border-0" />
        </div>
      </div>
    </div>
  )
}
