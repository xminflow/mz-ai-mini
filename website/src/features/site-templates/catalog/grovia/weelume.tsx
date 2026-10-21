import { groviaTemplate as sourceTemplate } from 'grovia-template/template'
import { GroviaHostProvider } from 'grovia-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

export const groviaTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/grovia-template',
  name: '微域生光 · 团队增长',
  localizedNames: { en: 'Weelume · Strategy & growth' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeGroviaPage(props: SiteTemplatePageProps) {
            return <GroviaHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></GroviaHostProvider>
          },
        }
      },
    })),
  })),
}
