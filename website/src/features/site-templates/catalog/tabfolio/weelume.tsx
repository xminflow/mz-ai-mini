import { tabfolioTemplate as sourceTemplate } from 'tabfolio-template/template'
import { TabfolioHostProvider } from 'tabfolio-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const tabfolioTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/tabfolio-template',
 name: "Tabfolio Pro · 设计师作品集",
 localizedNames: {"en":"Tabfolio Pro · Designer portfolio"},
 summary: "参考 Tabfolio Pro 设计师作品集模板，包含项目、实验、关于、简历与项目案例详情页，支持响应式布局和中英文路径。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeTabfolioPage(props: SiteTemplatePageProps){return <TabfolioHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><Page {...props} /></TabfolioHostProvider>} }
 } })) })),
}
