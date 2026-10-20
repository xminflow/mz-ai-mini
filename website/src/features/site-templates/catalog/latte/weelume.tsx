import { latteTemplate as sourceTemplate } from 'latte-template/template'
import { LatteHostProvider } from 'latte-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

export const latteTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Latte · 微域生光咖啡馆',
  localizedNames: { en: 'Latte · Weelume café' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeLattePage(props: SiteTemplatePageProps) {
            return <LatteHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></LatteHostProvider>
          },
        }
      },
    })),
  })),
}
