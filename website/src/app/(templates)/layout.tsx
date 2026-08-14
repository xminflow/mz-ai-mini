import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isTemplatesModuleEnabled } from '@/features/site-templates/config'

/**
 * 第二道门禁。middleware 已经在开关关闭时把 /templates 挡回首页，这里再挡一次：
 * middleware 的 matcher 将来若被改动，模板模块不应该跟着悄悄暴露出去。
 *
 * 同时这一层负责剥掉根 layout 对 <body> 做的官网视觉断言
 * （bg-paper / text-graphite）——根 layout 是全站唯一的，模板无法绕开，只能在这里覆盖。
 * 这里刻意不加任何页面骨架（导航、边距、最大宽度）：模板站点的真实路由也在这个 layout 之下，
 * 任何骨架都会渗进模板页面里。
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  if (!isTemplatesModuleEnabled()) {
    notFound()
  }

  return <div className="min-h-screen bg-neutral-950 text-neutral-100">{children}</div>
}
