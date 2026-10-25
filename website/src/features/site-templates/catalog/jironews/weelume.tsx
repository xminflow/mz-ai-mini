import { jironewsTemplate as sourceTemplate } from 'jironews-template/template'
import { JironewsHostProvider } from 'jironews-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 宿主只注入品牌、市场入口与备案；页面源码由独立工程维护。 */
export const jironewsTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'JiroNews · 微域生光新闻视界',
  localizedNames: { en: 'JiroNews · Weelume news & perspectives' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeJironewsPage(props: SiteTemplatePageProps) {
            return <JironewsHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></JironewsHostProvider>
          },
        }
      },
    })),
  })),
}
