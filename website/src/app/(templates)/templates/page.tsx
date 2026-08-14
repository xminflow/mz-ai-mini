import type { Metadata } from 'next'
import { SITE_TEMPLATES } from '@/features/site-templates/registry'
import { TemplateCard } from '@/features/site-templates/workbench/TemplateCard'

export const metadata: Metadata = {
  title: { absolute: '模板工作台' },
}

export default function TemplatesWorkbenchPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="border-b border-white/10 pb-8">
        <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">
          DEV ONLY · {SITE_TEMPLATES.length} TEMPLATES
        </p>
        <h1 className="mt-3 text-3xl font-semibold">整站模板工作台</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
          这里的全部内容只在开发环境可见。生产环境未设置 TEMPLATES_MODULE_ENABLED=true 时，
          /templates 会被 middleware 直接挡回首页。
        </p>
      </header>

      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </main>
  )
}
