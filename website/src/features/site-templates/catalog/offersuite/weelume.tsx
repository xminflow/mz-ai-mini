import { offersuiteTemplate as sourceTemplate } from 'offersuite-template/template'
import { OfferSuiteHostProvider } from 'offersuite-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 品牌、市场入口及示例备案由主站注入，通用源码在独立工程维护。 */
export const offersuiteTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/offersuite-template',
  name: 'OfferSuite · 微域生光料理体验',
  localizedNames: { en: 'OfferSuite · Weelume culinary journeys' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeOfferSuitePage(props: SiteTemplatePageProps) {
            return <OfferSuiteHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></OfferSuiteHostProvider>
          },
        }
      },
    })),
  })),
}
