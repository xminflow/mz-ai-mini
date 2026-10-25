import { noterTemplate as sourceTemplate } from 'noter-template/template'
import { NoterHostProvider } from 'noter-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 宿主只注入品牌、市场入口与备案；页面源码由独立工程维护。 */
export const noterTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Noter · 微域生光设计手记',
  localizedNames: { en: 'Noter · Weelume editorial blog' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeNoterPage(props: SiteTemplatePageProps) {
            return <NoterHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></NoterHostProvider>
          },
        }
      },
    })),
  })),
}
