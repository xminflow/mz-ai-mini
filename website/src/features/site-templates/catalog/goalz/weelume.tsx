import {goalzTemplate as sourceTemplate} from 'goalz-template/template'
import type {CSSProperties} from 'react'
import {GoalzHostProvider} from 'goalz-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'

/** 通用页面和运行素材由独立模板包维护，宿主只注入品牌、市场入口和示例备案。 */
export const goalzTemplate:SiteTemplate={
 ...sourceTemplate,
 gitUrl:'https://github.com/weelume/goalz-template',
 name:'微域生光 · 足球训练学院',
 localizedNames:{en:'Weelume · Football Academy'},
 surfaces:sourceTemplate.surfaces.map(surface=>({...surface,pages:surface.pages.map(page=>({...page,
  load:async()=>{const {default:Page}=await page.load();return {default:function WeelumeGoalzPage(props:SiteTemplatePageProps){
   // 主站 base 层为标题指定 --font-display，局部覆盖以保留模板自身字体。
   return <GoalzHostProvider brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-inverted.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling/>}><div style={{'--font-display':'GoalzPoppins, GoalzMiSans, sans-serif'} as CSSProperties}><Page {...props}/></div></GoalzHostProvider>
  }}}
 }))})),
}
