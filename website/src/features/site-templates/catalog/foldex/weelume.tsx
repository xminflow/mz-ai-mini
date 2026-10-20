import { foldexTemplate as sourceTemplate } from 'foldex-template/template'
import { FoldexHostProvider } from 'foldex-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

export const foldexTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Foldex · 微域生光创意工作室',
  localizedNames: { en: 'Foldex · Weelume creative studio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeFoldexPage(props: SiteTemplatePageProps) {
            return <FoldexHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></FoldexHostProvider>
          },
        }
      },
    })),
  })),
}
