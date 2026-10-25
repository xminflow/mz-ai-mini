import { portfolicaTemplate as sourceTemplate } from 'portfolica-template/template'
import { PortfolicaHostProvider } from 'portfolica-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌、市场入口和备案在宿主层注入，通用源码由独立模板维护。 */
export const portfolicaTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/portfolica-template',
  name: 'Portfolica · 微域生光数字设计师作品集',
  localizedNames: { en: 'Portfolica · Weelume digital designer portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumePortfolicaPage(props: SiteTemplatePageProps) {
            return <PortfolicaHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></PortfolicaHostProvider>
          },
        }
      },
    })),
  })),
}
