import { luneraTemplate as sourceTemplate } from 'lunera-template/template'
import { LuneraHostProvider } from 'lunera-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

export const luneraTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/lunera-template',
  name: '微域生光 · 智能财务',
  localizedNames: { en: 'Weelume · Financial clarity' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeLuneraPage(props: SiteTemplatePageProps) {
            return <LuneraHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></LuneraHostProvider>
          },
        }
      },
    })),
  })),
}
