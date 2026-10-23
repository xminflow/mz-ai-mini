import { artemisTemplate as sourceTemplate } from 'artemis-template/template'
import { ArtemisHostProvider } from 'artemis-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌、市场入口与示例备案只在宿主层注入。 */
export const artemisTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/artemis-template',
  name: 'Artemis · 微域生光设计作品集',
  localizedNames: { en: 'Artemis · Weelume design portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeArtemisPage(props: SiteTemplatePageProps) {
            return <ArtemisHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></ArtemisHostProvider>
          },
        }
      },
    })),
  })),
}
