import { ilseMorenoTemplate as sourceTemplate } from 'ilse-moreno-template/template'
import { IlseMorenoHostProvider } from 'ilse-moreno-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站只注入品牌、市场入口和示例备案，通用模板不包含主站信息。 */
export const ilseMorenoTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/ilse-moreno-template',
  name: 'Ilse Moreno · 微域生光交互作品集',
  localizedNames: { en: 'Ilse Moreno · Weelume canvas portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeIlseMorenoPage(props: SiteTemplatePageProps) {
            return <IlseMorenoHostProvider
              locale={props.locale}
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></IlseMorenoHostProvider>
          },
        }
      },
    })),
  })),
}
