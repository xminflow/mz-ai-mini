import { kittypawTemplate as sourceTemplate } from 'kittypaw-template/template'
import { KittypawHostProvider } from 'kittypaw-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 页面、双语和动效使用独立源码包；宿主仅注入品牌、市场与示例备案。 */
export const kittypawTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Kittypaw · 微域生光猫咪生活',
  localizedNames: { en: 'Kittypaw · Weelume cat care' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeKittypawPage(props: SiteTemplatePageProps) {
            return <KittypawHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></KittypawHostProvider>
          },
        }
      },
    })),
  })),
}
