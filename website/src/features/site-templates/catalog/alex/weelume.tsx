import Link from 'next/link'
import { alexTemplate as sourceTemplate } from 'alex-template/template'
import { AlexHostProvider } from 'alex-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'
export const alexTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/alex-template',
  name: '微域生光 · 专业法律顾问',
  localizedNames: { en: 'Weelume · Legal Counsel Portfolio' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return { default: function WeelumeAlexPage(props: SiteTemplatePageProps) {
          return <AlexHostProvider brandName={{ zh: '微域生光', en: 'Weelume' }}
            logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-inverted.svg"
            marketplaceHref="/templates" marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
            marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }} filing={<><p><Link href="/templates">{props.locale === 'en' ? 'Weelume: template marketplace' : '微域生光：模板市场'}</Link></p><TemplateFiling /></>}>
            <Page {...props} />
          </AlexHostProvider>
        } }
      },
    })),
  })),
}


