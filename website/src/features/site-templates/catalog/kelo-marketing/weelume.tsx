import { keloMarketingTemplate as sourceTemplate } from 'kelo-marketing-template/template'
import { KeloMarketingHostProvider } from 'kelo-marketing-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import { PageScrollbar } from '../../shared/PageScrollbar'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'
import '../../shared/page-scrollbar.css'
import './host.css'

export const keloMarketingTemplate: SiteTemplate = {
  ...sourceTemplate,
  name: '微域生光 · AI 营销',
  localizedNames: { en: 'Weelume · AI Marketing' },
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeKeloMarketingPage(props: SiteTemplatePageProps) {
            return (
              <KeloMarketingHostProvider
                brandName={{ zh: '微域生光', en: 'Weelume' }}
                logo="/logo/weiyu-logo-web-dark.svg"
                lightLogo="/logo/weiyu-logo-inverted.svg"
                marketplaceHref="/templates"
                marketplaceLabel={{ zh: '微域生光：模板市场', en: 'Weelume: template marketplace' }}
                marketplaceAriaLabel={{ zh: '打开微域生光模板市场', en: 'Open Weelume template marketplace' }}
                filing={<TemplateFiling />}
              >
                <Page {...props} />
                <PageScrollbar
                  className="template-scrollbar"
                  controlsId="km-main"
                  label={props.locale === 'en' ? 'Page scroll' : '页面滚动'}
                  autoHide
                />
              </KeloMarketingHostProvider>
            )
          },
        }
      },
    })),
  })),
}
