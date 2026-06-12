import type { ReactNode } from 'react'

/**
 * 手写 SVG 图示容器 — 语义 <figure>/<figcaption>
 * children 为内联 JSX <svg>
 * 纯服务端组件，无 'use client'，无 any，无未用导入。
 */

export function Figure({
  title,
  caption,
  children,
}: {
  title?: string
  caption?: string
  children: ReactNode
}): React.JSX.Element {
  return (
    <figure className="mt-[2rem]">
      {title && (
        <p className="mb-[0.6rem] text-center text-[0.84rem] font-semibold text-ink">
          {title}
        </p>
      )}
      {/* SVG 块级展示：全宽、自适应高度 */}
      <div className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full">{children}</div>
      {caption && (
        <figcaption className="mt-[0.9rem] text-center text-[0.84rem] text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
