import { designfastTemplate as sourceTemplate } from 'designfast-template/template'
import Link from 'next/link'
import { DesignfastHostProvider } from 'designfast-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 页面与动效由独立包维护；宿主仅注入品牌、市场入口和示例备案。 */
export const designfastTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Designfast · 微域生光设计机构',
  localizedNames: { en: 'Designfast · Weelume design agency' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeDesignfastPage(props: SiteTemplatePageProps) {
            return <DesignfastHostProvider
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<><Link href="/templates">{props.locale === 'en' ? 'Weelume: template marketplace' : '微域生光：模板市场'}</Link><TemplateFiling /></>}
            ><Page {...props} /></DesignfastHostProvider>
          },
        }
      },
    })),
  })),
}
