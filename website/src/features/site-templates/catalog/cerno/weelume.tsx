import { cernoTemplate as sourceTemplate } from 'cerno-template/template'
import { CernoHostProvider } from 'cerno-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

export const cernoTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/cerno-template',
  name: 'Cerno · 微域生光设计工作室',
  localizedNames: { en: 'Cerno · Weelume design studio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeCernoPage(props: SiteTemplatePageProps) {
            return <CernoHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></CernoHostProvider>
          },
        }
      },
    })),
  })),
}
