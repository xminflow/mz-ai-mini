import Link from 'next/link'
import type { TemplatePresentation } from '../types'

export function TemplateCard({ template, showPageCount = true }: { template: TemplatePresentation; showPageCount?: boolean }) {
  return (
    <Link href={`/templates/${template.id}`} className="market-card group block min-w-0">
      <div className="market-card-art">
        <img src={template.screenshots[0].src} alt={template.screenshots[0].alt} width={template.screenshots[0].width ?? 1440} height={template.screenshots[0].height ?? 1000} className="market-card-image" loading="lazy" />
      </div>
      <div className="market-card-caption">
        <div className="min-w-0">
          <h2 className="market-card-title">{template.name}</h2>
          <p className="mt-1.5 text-[13px] text-muted">{template.category}{showPageCount && <><span className="mx-1.5">·</span> {template.surfaces.reduce((sum, surface) => sum + surface.pages.length, 0)} 个页面</>}</p>
        </div>
        <span className="market-label shrink-0">{template.surfaces.length > 1 ? '多端模板' : '整站模板'}</span>
      </div>
    </Link>
  )
}
