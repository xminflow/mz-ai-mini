import { habitlineTemplate as sourceTemplate } from 'habitline-template/template'
import { HabitlineHostProvider } from 'habitline-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 宿主仅注入品牌与市场入口，通用业务保持在独立模板中。 */
export const habitlineTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: 'Habitline · 微域生光从容习惯',
  localizedNames: { en: 'Habitline · Weelume daily habits' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeHabitlinePage(props: SiteTemplatePageProps) {
            return (
              <HabitlineHostProvider
                brandName={{ zh: '微域生光', en: 'Weelume' }}
                logo="/logo/weiyu-logo-web-dark.svg"
                lightLogo="/logo/weiyu-logo-inverted.svg"
                marketplaceHref="/templates"
                marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
                marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
                filing={<TemplateFiling />}
              >
                <Page {...props} />
              </HabitlineHostProvider>
            )
          },
        }
      },
    })),
  })),
}
