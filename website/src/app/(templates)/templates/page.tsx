import type { Metadata } from 'next'
import { SITE_TEMPLATES } from '@/features/site-templates/registry'
import { TemplateRow } from '@/features/site-templates/workbench/TemplateRow'

export const metadata: Metadata = {
  title: { absolute: '模板工作台' },
}

// 页面数要跨端累加：一套交付可能含官网 + 管理后台两个站，各有各的页面集
const TOTAL_SURFACES = SITE_TEMPLATES.reduce((sum, template) => sum + template.surfaces.length, 0)
const TOTAL_PAGES = SITE_TEMPLATES.reduce(
  (sum, template) =>
    sum + template.surfaces.reduce((surfaceSum, surface) => surfaceSum + surface.pages.length, 0),
  0,
)

export default function TemplatesWorkbenchPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-32 pt-24 sm:px-10 lg:pt-32">
      {/* 字号落差本身就是这一页的视觉主张：11px 的标记与近 72px 的标题之间差六倍多，
          不靠任何装饰元素就把层级立住了。 */}
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.22em] text-graphite-dim">DEV ONLY</p>
        <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
          整站模板工作台
        </h1>
        <p className="mt-8 text-[17px] leading-[1.85] text-graphite-soft">
          面向客户的整站设计样板。每套模板都有自己的设计语言与完整页面，可以按真实视口逐页预览。
        </p>
      </header>

      <p className="mt-16 font-mono text-[12px] leading-relaxed text-graphite-dim lg:mt-20">
        {SITE_TEMPLATES.length} 套模板 · {TOTAL_SURFACES} 个端 · {TOTAL_PAGES} 个页面 ·
        仅开发环境可见，生产环境需设置
        TEMPLATES_MODULE_ENABLED=true
      </p>

      {/* 行与行之间的分隔线由 TemplateRow 自带的 border-t 提供，
          第一条同时充当上面这行元信息的下边界，不另外再画一条 */}
      <div className="mt-6">
        {SITE_TEMPLATES.map((template) => (
          <TemplateRow key={template.id} template={template} />
        ))}
      </div>
    </main>
  )
}
