import { hydrowellTemplate as sourceTemplate } from 'hydrowell-template/template'
import { HydrowellHostProvider } from 'hydrowell-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 仅注入主站品牌、市场入口和示例备案，业务页面仍由独立工程维护。 */
export const hydrowellTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Hydrowell · 微域生光专业水暖',
  localizedNames: { en: 'Hydrowell · Weelume plumbing services' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeHydrowellPage(props: SiteTemplatePageProps) {
            return <HydrowellHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></HydrowellHostProvider>
          },
        }
      },
    })),
  })),
}
