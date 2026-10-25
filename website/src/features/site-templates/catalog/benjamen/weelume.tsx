import { benjamenTemplate as sourceTemplate } from 'benjamen-template/template'
import { BenjamenHostProvider } from 'benjamen-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'
export const benjamenTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/benjamen-template',
  name: '微域生光 · 品牌增长作品集',
  localizedNames: { en: 'Weelume · Social Media Portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return { default: function WeelumeBenjamenPage(props: SiteTemplatePageProps) {
          return <BenjamenHostProvider brandName={{ zh: '微域生光', en: 'Weelume' }}
            logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-inverted.svg"
            marketplaceHref="/templates" marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
            marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }} filing={<TemplateFiling />}>
            <Page {...props} />
          </BenjamenHostProvider>
        } }
      },
    })),
  })),
}
