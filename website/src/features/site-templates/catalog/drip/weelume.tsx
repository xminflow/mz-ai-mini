import { dripTemplate as sourceTemplate } from 'drip-template/template'
import { DripHostProvider } from 'drip-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站只注入品牌和市场入口，九章节通用页面由固定共享包维护。 */
export const dripTemplate: SiteTemplate = {
  ...sourceTemplate,
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeDripPage(props: SiteTemplatePageProps) {
            return <DripHostProvider brandName={{ zh: '微域生光', en: 'Weelume' }} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }} marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }} filing={<TemplateFiling />}><Page {...props}/></DripHostProvider>
          },
        }
      },
    })),
  })),
}
