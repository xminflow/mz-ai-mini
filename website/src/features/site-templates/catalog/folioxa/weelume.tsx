import { folioxaTemplate as sourceTemplate } from 'folioxa-template/template'
import { FolioxaHostProvider } from 'folioxa-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌、市场入口和备案在宿主层注入，通用源码由独立模板维护。 */
export const folioxaTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/folioxa-template',
  name: 'Folioxa · 微域生光创意作品集',
  localizedNames: { en: 'Folioxa · Weelume creative portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeFolioxaPage(props: SiteTemplatePageProps) {
            return <FolioxaHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></FolioxaHostProvider>
          },
        }
      },
    })),
  })),
}
