import { nuboTemplate as sourceTemplate } from 'nubo-template/template'
import { NuboHostProvider } from 'nubo-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const nuboTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/nubo-template',
 name: "微域生光 · 居家机器人",
 localizedNames: {"en":"Weelume · Home robotics"},
 summary: "参考 Nubo 的居家机器人中英文整站模板。覆盖首页、关于、四篇场景详情、产品更新、联系、候补名单、两份政策与 404。全屏本地影像、胶囊菜单、材质切换、FAQ 与本地校验演示表单，适配 PC、iPad 和 H5。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeNuboPage(props: SiteTemplatePageProps){return <NuboHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><Page {...props} /></NuboHostProvider>} }
 } })) })),
}
