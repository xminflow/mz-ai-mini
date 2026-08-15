import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isTemplatesModuleEnabled } from '@/features/site-templates/config'

/**
 * 第二道门禁。middleware 已经在开关关闭时把 /templates 挡回首页，这里再挡一次：
 * middleware 的 matcher 将来若被改动，模板模块不应该跟着悄悄暴露出去。
 *
 * 底色与官网保持一致（bg-paper / text-graphite），但仍然显式写出而不是靠继承根 layout：
 * 工作台的视觉规格应当由它自己声明，根 layout 将来若改了 body 的底色，
 * 不应该顺带把这个开发工具一起改掉。
 *
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

  return <div className="min-h-screen bg-paper text-graphite">{children}</div>
}
