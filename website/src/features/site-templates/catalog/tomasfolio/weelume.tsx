import './weelume.css'
import { tomasfolioTemplate as sourceTemplate } from 'tomasfolio-template/template'
import { TomasfolioHostProvider } from 'tomasfolio-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const tomasfolioTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/tomasfolio-template',
 name: "Tomasfolio · 创意品牌作品集",
 localizedNames: {"en":"Tomasfolio · Creative portfolio"},
 summary: "参考 Tomasfolio 的暖白与橙红视觉，包含五个案例、四篇文章、履历和联系表单，支持中英文及三端响应式。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeTomasfolioPage(props: SiteTemplatePageProps){return <TomasfolioHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><div className="tomasfolio-host"><Page {...props} /></div></TomasfolioHostProvider>} }
 } })) })),
}
