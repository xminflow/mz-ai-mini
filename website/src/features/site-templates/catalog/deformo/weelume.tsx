import { deformoTemplate as sourceTemplate } from 'deformo-template/template'
import { DeformoHostProvider } from 'deformo-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

export const deformoTemplate: SiteTemplate = {
  ...sourceTemplate,
  gitUrl: 'https://github.com/weelume/deformo-template',
  surfaces: sourceTemplate.surfaces.map(surface => ({
    ...surface,
    pages: surface.pages.map(page => ({
      ...page,
      load: async () => {
        const { default: Page } = await page.load()
        return {
          default: function WeelumeDeformoPage(props: SiteTemplatePageProps) {
            return <DeformoHostProvider marketplaceHref="/templates" filing={<TemplateFiling />}><Page {...props} /></DeformoHostProvider>
          },
        }
      },
    })),
  })),
}
