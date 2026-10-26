import { rhysTemplate as sourceTemplate } from 'rhys-template/template'
import { RhysHostProvider } from 'rhys-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'
import './host.css'

/** 主站品牌、市场入口与示例备案仅由宿主注入。 */
export const rhysTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/rhys-template',
  name: 'Rhys · 微域生光设计作品集',
  localizedNames: { en: 'Rhys · Weelume designer portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeRhysPage(props: SiteTemplatePageProps) {
            return <RhysHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></RhysHostProvider>
          },
        }
      },
    })),
  })),
}
