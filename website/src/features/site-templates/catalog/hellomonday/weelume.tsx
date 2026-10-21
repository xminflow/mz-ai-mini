import { hellomondayTemplate as sourceTemplate } from 'hellomonday-template/template'
import { HellomondayHostProvider } from 'hellomonday-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const hellomondayTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/hellomonday-template',
 name: "微域生光 · 黑白创意工作室",
 localizedNames: {"en":"Weelume · Playful creative studio"},
 summary: "参考 Hello Monday 的黑白手绘、弧形菜单与错落作品布局，按项目标准使用微域生光品牌与本地 MiSans / Poppins 字体。包含首页、作品、服务、关于、故事、产品、联系、求职与实习、政策，以及 70 个案例解读和 7 篇故事。支持双语路径、搜索筛选、影像预览与本地表单校验。原站素材仅限内部预览，正式交付前须取得许可或替换。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeHellomondayPage(props: SiteTemplatePageProps){return <HellomondayHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><Page {...props} /></HellomondayHostProvider>} }
 } })) })),
}
