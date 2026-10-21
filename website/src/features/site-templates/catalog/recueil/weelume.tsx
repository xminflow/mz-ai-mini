import { recueilTemplate as sourceTemplate } from 'recueil-template/template'
import { RecueilHostProvider } from 'recueil-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const recueilTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/recueil-template',
 name: "微域生光 · 香氛订阅",
 localizedNames: {"en":"Weelume · Fragrance atelier"},
 summary: "参考 Recueil 的蓝紫色香氛视觉与长页叙事，覆盖完整首页、隐私说明和 404 页面。包含香氛库、六种原料切换、故事、三种订阅方案、FAQ 及本地表单演示，统一微域生光品牌与中英文排版。源站素材仅供内部预览，商用前需授权或替换。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeRecueilPage(props: SiteTemplatePageProps){return <RecueilHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><Page {...props} /></RecueilHostProvider>} }
 } })) })),
}
