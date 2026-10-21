'use client'

import Link from 'next/link'
import { buttonClassName } from '@/components/ui'
import { useContact } from '@/components/layout/contact-context'
import { TEMPLATE_DEVICES } from '../devices'
import { TEMPLATE_PLATFORM_LABELS, type TemplatePresentation } from '../types'
import { TemplateCard } from './TemplateCard'
import { TemplateGallery } from './TemplateGallery'
import { WorkBuddyGuide } from './WorkBuddyGuide'
import releases from '../../../../templates/releases.json'

export function TemplateDetails({ template, related }: { template: TemplatePresentation; related: TemplatePresentation[] }) {
  const { openContact } = useContact()
  const previewPath = `/templates/${template.id}/${template.surfaces[0].id}`
  const devices = [...new Set(template.screenshots.flatMap(shot => shot.device ? [shot.device] : []))]

  return (
    <div className="market-container market-detail pb-24">
      <nav aria-label="面包屑" className="market-detail-breadcrumb flex items-center gap-2.5 pb-9 pt-8 text-[12px] text-muted">
        <Link href="/templates" className="hover:text-ink">模板</Link><span aria-hidden>/</span><span className="text-ink-soft">{template.name}</span>
      </nav>

      <header className="market-detail-header">
        <div>
          <p className="market-eyebrow">{template.category}</p>
          <h1 className="mt-3 text-[clamp(1.8rem,4vw,2.5rem)] font-medium leading-tight tracking-[-0.035em]">{template.name}</h1>
        </div>
        <div className="market-detail-actions flex gap-2.5">
          <Link href={previewPath} target="_blank" rel="noopener noreferrer" className={buttonClassName('secondary', 'market-secondary')}>在线预览</Link>
          <button type="button" onClick={openContact} className={buttonClassName('primary', 'market-primary')}>定制同款</button>
        </div>
      </header>

      <WorkBuddyGuide key={template.id} templateName={template.name} downloadUrl={(releases as Record<string, { url: string }>)[template.id]?.url} />

      <TemplateGallery template={template} />

      <div className="market-detail-grid">
        <div className="min-w-0">
          <section aria-labelledby="template-about" className="market-detail-section">
            <h2 id="template-about" className="market-section-title">关于这套模板</h2>
            <p className="mt-5 text-[15px] leading-[1.95] text-muted">{template.summary}</p>
            <div className="mt-7 flex flex-wrap gap-2">{template.tags.map((tag) => <span className="market-tag" key={tag}>{tag}</span>)}</div>
          </section>

          <section aria-labelledby="template-pages" className="market-detail-section">
            <h2 id="template-pages" className="market-section-title">包含的页面</h2>
            <p className="mt-3 text-[13px] leading-6 text-muted">{devices.length > 1 ? `同一站点适配 ${devices.map(device => TEMPLATE_DEVICES[device].label).join('、')}，可在上方选择设备并打开交互预览。` : '每个端都是独立站点，点击页面可直接查看实际效果。'}</p>
            <div className="mt-6 space-y-7">
              {template.surfaces.map((surface) => (
                <div key={surface.id}>
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">{surface.name}<span className="market-label">{devices.length > 1 && template.surfaces.length === 1 ? devices.map(device => TEMPLATE_DEVICES[device].label).join(' / ') : TEMPLATE_PLATFORM_LABELS[surface.platform]}</span></div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {surface.pages.map((page, index) => (
                      <a key={page.slug} href={`/templates/${template.id}/${surface.id}${page.slug ? `/${page.slug}` : ''}`} target="_blank" rel="noreferrer" className="market-page-link">
                        <span className="font-mono text-[11px] text-muted">{String(index + 1).padStart(2, '0')}</span><span>{page.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="market-detail-section">
            <h2 className="market-section-title">让模板成为你的项目</h2>
            <p className="mt-4 text-[14px] leading-7 text-muted">这些页面用于展示设计与交互，内容采用演示数据。正式项目会结合你的品牌、业务流程和数据接口进行定制。</p>
            <Link href="/#services" className="mt-5 inline-flex items-center gap-2 text-sm text-ink hover:text-accent">了解我们的定制服务</Link>
          </section>
        </div>

      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-templates" className="border-t border-hairline pt-12">
          <div className="mb-7 flex items-center justify-between gap-4"><h2 id="related-templates" className="market-section-title">继续探索</h2><Link href="/templates" className="text-[13px] text-muted hover:text-ink">查看全部模板</Link></div>
          <div className="grid gap-7 md:grid-cols-2">{related.map((item) => <TemplateCard key={item.id} template={item} showPageCount={false} />)}</div>
        </section>
      )}
    </div>
  )
}
