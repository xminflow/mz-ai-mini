import { solarisTemplate as sourceTemplate } from 'solaris-template/template'
import { SolarisHostProvider } from 'solaris-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌、市场入口与示例备案仅由宿主注入。 */
export const solarisTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/solaris-template',
  name: 'Solaris · 微域生光智慧能源',
  localizedNames: { en: 'Solaris · Weelume solar energy' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeSolarisPage(props: SiteTemplatePageProps) {
            return <SolarisHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></SolarisHostProvider>
          },
        }
      },
    })),
  })),
}
