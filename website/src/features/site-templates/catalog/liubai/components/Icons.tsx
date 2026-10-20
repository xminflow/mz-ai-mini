import type { ReactNode } from 'react'

/**
 * 模板内部用到的线性图标。
 *
 * 集中在一处而不是散在各页面里：参考站的流程、能力、服务、报价四个区块都靠"圆角方块里的图标"
 * 建立同一种节奏，图标风格一旦各画各的，那四个区块就散成四套东西。
 * 统一 24 viewBox、1.6 描边、round 端点，尺寸由使用处的 className 给。
 */

const P = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export type IconName =
  | 'search'
  | 'bulb'
  | 'compass'
  | 'pen'
  | 'code'
  | 'package'
  | 'wallet'
  | 'layers'
  | 'trend'
  | 'zap'
  | 'sliders'
  | 'palette'
  | 'headset'
  | 'check'
  | 'wand'
  | 'ruler'
  | 'crown'
  | 'users'
  | 'star'

const PATHS: Record<IconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" {...P} />
      <path d="m16 16 4 4" {...P} />
    </>
  ),
  bulb: (
    <>
      <path d="M9.5 17h5M10 20h4" {...P} />
      <path d="M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3z" {...P} />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" {...P} />
      <path d="m15.2 8.8-2 4.4-4.4 2 2-4.4z" {...P} />
    </>
  ),
  pen: (
    <>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" {...P} />
      <path d="m14.5 6.5 3 3" {...P} />
    </>
  ),
  code: (
    <>
      <path d="m8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13.5 5l-3 14" {...P} />
    </>
  ),
  package: (
    <>
      <path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z" {...P} />
      <path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9" {...P} />
    </>
  ),
  wallet: (
    <>
      <rect x="3.5" y="6" width="17" height="13" rx="2.5" {...P} />
      <path d="M3.5 10h17M16 14.5h1.5" {...P} />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8 4.5-8 4.5-8-4.5z" {...P} />
      <path d="m4 13 8 4.5 8-4.5" {...P} />
    </>
  ),
  trend: (
    <>
      <path d="M4 16.5 9.5 11l3.5 3.5L20 7.5" {...P} />
      <path d="M15 7.5h5v5" {...P} />
    </>
  ),
  zap: <path d="M13.5 3 5.5 13.5H11l-.5 7.5 8-10.5H13z" {...P} />,
  sliders: (
    <>
      <path d="M5 7h14M5 12h14M5 17h14" {...P} />
      <circle cx="9" cy="7" r="2" {...P} />
      <circle cx="15" cy="12" r="2" {...P} />
      <circle cx="9" cy="17" r="2" {...P} />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.5-1.3-1.6-1.3-2.7 0-.8.7-1.4 1.6-1.4h1.4a4.5 4.5 0 0 0 4.5-4.5c0-3.6-3.6-6.7-8-6.7z" {...P} />
      <circle cx="8" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  headset: (
    <>
      <path d="M5 14v-2a7 7 0 0 1 14 0v2" {...P} />
      <rect x="3.5" y="13.5" width="3.5" height="5.5" rx="1.5" {...P} />
      <rect x="17" y="13.5" width="3.5" height="5.5" rx="1.5" {...P} />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" {...P} />
      <path d="m8.5 12.2 2.4 2.4 4.6-5" {...P} />
    </>
  ),
  wand: (
    <>
      <path d="M5 19 16 8" {...P} />
      <path d="M14.5 3.5 15.5 6l2.5 1-2.5 1-1 2.5-1-2.5L11 7l2.5-1z" {...P} />
    </>
  ),
  ruler: (
    <>
      <path d="M12 4v11" {...P} />
      <path d="m8 20 4-9 4 9" {...P} />
      <circle cx="12" cy="4" r="1.6" {...P} />
    </>
  ),
  crown: (
    <>
      <path d="M4 17h16M4.5 8.5 8 12l4-6 4 6 3.5-3.5-1.2 8.5H5.7z" {...P} />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" {...P} />
      <path d="M3.5 18.5a5.5 5.5 0 0 1 11 0" {...P} />
      <path d="M16 6a3 3 0 0 1 0 5M17.5 18.5a5.5 5.5 0 0 0-2-4.2" {...P} />
    </>
  ),
  star: <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.6-.8z" fill="currentColor" stroke="none" />,
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {PATHS[name]}
    </svg>
  )
}

/**
 * 圆角方块图标徽标。参考站的流程、能力、服务、报价四处都用它，
 * 只有深浅两档：`tone='light'` 是白底浮起、`tone='dark'` 是墨底反白。
 */
export function IconBadge({
  name,
  tone = 'light',
  className,
}: {
  name: IconName
  tone?: 'light' | 'dark' | 'plain'
  className?: string
}) {
  if (tone === 'plain') {
    // 未激活态：不给底、不给阴影，只留一个灰图标——与激活态拉开的是"有没有实体"
    return <Icon name={name} className={`size-6 text-[var(--tpl-ink-faint)] ${className ?? ''}`} />
  }

  const dark = tone === 'dark'
  return (
    <span
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] ${
        dark
          ? 'bg-[var(--tpl-ink)] text-[var(--tpl-ink-invert)]'
          : 'bg-[var(--tpl-card)] text-[var(--tpl-ink)] shadow-[0_1px_2px_rgb(18_18_24/0.06),0_6px_16px_-8px_rgb(18_18_24/0.25)]'
      } ${className ?? ''}`}
    >
      <Icon name={name} className="size-5" />
    </span>
  )
}
