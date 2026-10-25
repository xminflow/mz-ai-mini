import { rescaleTemplate as sourceTemplate } from 'rescale-template/template'
import { RescaleHostProvider } from 'rescale-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

const screenshotOrder = ['home', 'features', 'journal', 'contact']
const screenshotRank = (src: string): number => {
  const rank = screenshotOrder.findIndex(page => src.endsWith(`-${page}.webp`))
  return rank < 0 ? screenshotOrder.length : rank
}
const screenshots: SiteTemplate['screenshots'] = [...sourceTemplate.screenshots]
screenshots.sort((a, b) => screenshotRank(a.src) - screenshotRank(b.src))

/** 主站只注入品牌、市场入口和示例备案，通用模板不包含主站信息。 */
export const rescaleTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/rescale-template',
  name: 'Rescale · 微域生光智能增长',
  localizedNames: { en: 'Rescale · Weelume AI analytics' },
  screenshots,
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeRescalePage(props: SiteTemplatePageProps) {
            return <RescaleHostProvider
              locale={props.locale}
              brandName={{ zh: '微域生光', en: 'Weelume' }}
              logo="/logo/weiyu-logo-web-dark.svg"
              lightLogo="/logo/weiyu-logo-inverted.svg"
              marketplaceHref="/templates"
              marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
              marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
              filing={<TemplateFiling />}
            ><Page {...props} /></RescaleHostProvider>
          },
        }
      },
    })),
  })),
}
