import type { Metadata } from 'next'
import { getTemplatesNewestFirst } from '@/features/site-templates/registry'
import { MarketplaceShell } from '@/features/site-templates/workbench/MarketplaceShell'
import { TemplateCatalog } from '@/features/site-templates/workbench/TemplateCatalog'
import { toTemplatePresentation } from '@/features/site-templates/workbench/presentation'

export const metadata: Metadata = {
  title: { absolute: '探索模板 · 微域生光' },
}

export default function TemplatesWorkbenchPage() {
  return (
    <MarketplaceShell>
      <div className="market-container">
        <TemplateCatalog templates={getTemplatesNewestFirst().map(toTemplatePresentation)} />
      </div>
    </MarketplaceShell>
  )
}
