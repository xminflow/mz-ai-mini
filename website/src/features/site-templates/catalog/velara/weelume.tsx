import { velaraTemplate as sourceTemplate } from 'velara-template/template'
import { VelaraHostProvider } from 'velara-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 页面与动效由独立包维护；宿主仅注入品牌、市场入口和示例备案。 */
export const velaraTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Velara AI · 微域生光智能财务',
  localizedNames: { en: 'Velara AI · Weelume smart finance' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeVelaraPage(props: SiteTemplatePageProps) {
            return <VelaraHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></VelaraHostProvider>
          },
        }
      },
    })),
  })),
}
