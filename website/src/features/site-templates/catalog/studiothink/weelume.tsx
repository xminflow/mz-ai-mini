import { studiothinkTemplate as sourceTemplate } from 'studiothink-template/template'
import { StudiothinkHostProvider } from 'studiothink-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const studiothinkTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/studiothink-template',
 name: "微域生光 · 视觉设计工作室",
 localizedNames: {"en":"Weelume · Visual design studio"},
 summary: "参考 Studio Think 的视觉设计工作室官网，并统一为微域生光品牌。默认中文并提供 /en 英文路径，包含首页、关于、作品与联系，使用本地影像、手写批注、作品画廊和演示联系表单，适配 PC、iPad 与 H5。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeStudiothinkPage(props: SiteTemplatePageProps){return <StudiothinkHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><Page {...props} /></StudiothinkHostProvider>} }
 } })) })),
}
