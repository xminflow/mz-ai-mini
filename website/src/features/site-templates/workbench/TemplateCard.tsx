import Link from 'next/link'
import type { SiteTemplate } from '../types'

export function TemplateCard({ template }: { template: SiteTemplate }) {
  return (
    <Link href={`/templates/${template.id}/preview`} className="group block">
      {/* 封面用原生 img：next/image 处理 SVG 需要打开 dangerouslyAllowSVG，
          为一个开发期工具改全局配置不值得。 */}
      <img
        src={template.cover}
        alt={`${template.name} 封面`}
        className="aspect-[16/10] w-full rounded-lg object-cover opacity-85 transition group-hover:opacity-100"
      />
      <div className="mt-4 flex items-baseline gap-2">
        <span
          className="size-2 shrink-0 translate-y-px rounded-full"
          style={{ backgroundColor: template.accentColor }}
          aria-hidden
        />
        <h2 className="text-base font-medium text-neutral-100">{template.name}</h2>
        <span className="text-xs text-neutral-500">{template.industry}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{template.summary}</p>
      <p className="mt-2 font-mono text-xs text-neutral-600">
        {template.tags.join(' · ')} · {template.pages.length} 页
      </p>
    </Link>
  )
}
