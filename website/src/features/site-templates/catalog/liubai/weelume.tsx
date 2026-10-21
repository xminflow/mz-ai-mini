import { liubaiTemplate as sourceTemplate } from 'liubai-template/template'
import { LiubaiHostProvider } from 'liubai-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const liubaiTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/liubai-template',
 name: "留白设计工作室",
 localizedNames: {"en":"Liubai Design Studio"},
 summary: "设计工作室双语官网，包含作品、关于、文章、联系及服务展示。仅保留官网，不包含管理后台。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeLiubaiPage(props: SiteTemplatePageProps){return <LiubaiHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><Page {...props} /></LiubaiHostProvider>} }
 } })) })),
}
