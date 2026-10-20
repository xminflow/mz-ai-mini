import type { SiteLocale } from '@/features/site-i18n/copy'
import { LightShell } from '@/components/layout/LightShell'
import { TemplateMarketSection } from '@/features/site-templates/components/TemplateMarketSection'
import { getTemplatesNewestFirst } from '@/features/site-templates/registry'

import { Advantages } from './Advantages'
import { CapabilityBar } from './CapabilityBar'
import { Hero } from './Hero'
import { HomeContact } from './HomeContact'
import { OpsPlatform } from './OpsPlatform'
import { ServiceFlow } from './ServiceFlow'
import { ServiceTypes } from './ServiceTypes'

export const HomeContent = ({ locale = 'zh' }: { locale?: SiteLocale }) => (
  <LightShell glow="none" locale={locale} className="home-typography home-redesign">
    <div className="home-first-screen">
      <Hero previews={getTemplatesNewestFirst().slice(0, 2).map(template => {
        const name = locale === 'en' ? template.localizedNames?.en : template.name
        if (!name) throw new Error(`[home] Missing ${locale} translation for template ${template.id}`)
        return { name, src: template.screenshots[0].src, href: `/templates/${template.id}` }
      })} />
      <CapabilityBar locale={locale} />
    </div>
    <TemplateMarketSection locale={locale} />
    <ServiceTypes />
    <ServiceFlow />
    <Advantages />
    <OpsPlatform />
    <HomeContact />
  </LightShell>
)
