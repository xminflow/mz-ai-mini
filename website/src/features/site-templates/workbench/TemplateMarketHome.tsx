import { notFound } from 'next/navigation'
import { isTemplatesModuleEnabled } from '../config'
import { getCatalogNewestFirst } from '../catalog-data'
import { MarketplaceShell } from './MarketplaceShell'
import { TemplateCatalog } from './TemplateCatalog'

// 首页与历史 /templates 入口共用同一套市场内容，避免维护两份页面。
export function TemplateMarketHome() {
  if (!isTemplatesModuleEnabled()) notFound()
  return <MarketplaceShell>
    <div className="market-container">
      <TemplateCatalog templates={getCatalogNewestFirst()} />
    </div>
  </MarketplaceShell>
}
