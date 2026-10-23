import { graybeamTemplate as sourceTemplate } from 'graybeam-template/template'
import { GraybeamHostProvider } from 'graybeam-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌、市场入口和备案在宿主层注入，通用源码由独立模板维护。 */
export const graybeamTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/graybeam-template',
  name: 'Graybeam · 微域生光建筑施工',
  localizedNames: { en: 'Graybeam · Weelume construction' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeGraybeamPage(props: SiteTemplatePageProps) {
            return <GraybeamHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></GraybeamHostProvider>
          },
        }
      },
    })),
  })),
}
