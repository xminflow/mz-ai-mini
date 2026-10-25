import { zenpandaTemplate as sourceTemplate } from 'zenpanda-template/template'
import { ZenpandaHostProvider } from 'zenpanda-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 通用页面由独立包维护，宿主只注入品牌、市场入口与示例备案。 */
export const zenpandaTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Zenpanda · 微域生光慢生活',
  localizedNames: { en: 'Zenpanda · Weelume mindful living' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeZenpandaPage(props: SiteTemplatePageProps) {
            return <ZenpandaHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></ZenpandaHostProvider>
          },
        }
      },
    })),
  })),
}
