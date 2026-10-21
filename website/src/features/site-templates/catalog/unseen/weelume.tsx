import { unseenTemplate as sourceTemplate } from 'unseen-template/template'
import { UnseenHostProvider } from 'unseen-template/host'
import { TemplateFiling } from '../../shared/TemplateFiling'
import type { SiteTemplate, SiteTemplatePageProps } from '../../types'

/** 主站品牌与市场入口在适配层注入，通用页面只从固定共享包加载。 */
export const unseenTemplate: SiteTemplate = {
 ...sourceTemplate,
 gitUrl: 'https://github.com/weelume/unseen-template',
 name: "微域生光 · 超现实创意工作室",
 localizedNames: {"en":"Weelume · Surreal creative studio"},
 summary: "参考 Unseen Studio 的粉色建筑空间、水面折射与创意画廊，统一微域生光品牌。覆盖首页、作品、联系、World、36 个项目解读与两篇模板政策说明。默认中文、支持英文；本地场景影像结合原生 WebGL 折射水面，提供作品筛选、可拖拽缩放画廊、媒体预览、环境音与本地演示表单。参考素材仅供内部预览，正式交付前需确认许可或替换。",
 surfaces: sourceTemplate.surfaces.map(surface => ({ ...surface, pages: surface.pages.map(page => ({ ...page, load: async () => {
 const {default: Page}=await page.load()
 return { default: function WeelumeUnseenPage(props: SiteTemplatePageProps){return <UnseenHostProvider locale={props.locale ?? 'zh'} brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-web-light.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling />}><Page {...props} /></UnseenHostProvider>} }
 } })) })),
}
