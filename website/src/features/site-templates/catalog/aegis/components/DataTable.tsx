import type { ReactNode } from 'react'

/**
 * 表格原语。
 *
 * 刻意不做「传 columns 配置自动渲染」的通用表格：控制台里每张表的单元格
 * 都要塞徽标、色条、迷你趋势线，配置化反而要为每种情况开一个逃生口，
 * 最后比直接写 JSX 更绕。这里只统一外观，结构交给各页自己写。
 */

export function Table({ children, minWidth }: { children: ReactNode; minWidth?: number }) {
  // 表格是控制台里最容易在窄屏溢出的元素，一律由自身容器横向滚动，
  // 而不是让整个页面出现横向滚动条。
  return (
    <div className="tpl-scroll w-full overflow-x-auto">
      <table className="w-full border-collapse text-left" style={minWidth ? { minWidth } : undefined}>
        {children}
      </table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[var(--tpl-rule)] bg-[var(--tpl-subtle)]">
      <tr>{children}</tr>
    </thead>
  )
}

export function TH({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-3 py-2 text-[11px] font-medium text-[var(--tpl-fg-dim)] ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--tpl-rule)]">{children}</tbody>
}

export function TR({ children }: { children: ReactNode }) {
  return <tr className="transition hover:bg-[var(--tpl-subtle)]">{children}</tr>
}

export function TD({
  children,
  align = 'left',
  mono = false,
  dim = false,
  nowrap = false,
}: {
  children: ReactNode
  align?: 'left' | 'right'
  /** 数字与标识符用等宽字体并开启等宽数字，保证纵向对齐 */
  mono?: boolean
  dim?: boolean
  nowrap?: boolean
}) {
  const classes = [
    'px-3 py-2.5 text-[12px] align-middle',
    align === 'right' ? 'text-right' : '',
    mono ? 'font-[family-name:var(--tpl-font-mono)] tabular-nums' : '',
    dim ? 'text-[var(--tpl-fg-dim)]' : '',
    nowrap ? 'whitespace-nowrap' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return <td className={classes}>{children}</td>
}
