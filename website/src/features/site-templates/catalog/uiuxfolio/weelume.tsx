import { uiuxfolioTemplate as sourceTemplate } from 'uiuxfolio-template/template'
import { UIUXfolioHostProvider } from 'uiuxfolio-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

export const uiuxfolioTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'UIUXfolio · 微域生光设计师作品集',
  localizedNames: { en: 'UIUXfolio · Weelume designer portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeUIUXfolioPage(props: SiteTemplatePageProps) {
            return <UIUXfolioHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></UIUXfolioHostProvider>
          },
        }
      },
    })),
  })),
}
