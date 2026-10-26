import {playoraTemplate as sourceTemplate} from 'playora-template/template'
import {PlayoraHostProvider} from 'playora-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import {PageScrollbar} from '../../shared/PageScrollbar'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'
import '../../shared/page-scrollbar.css'
import './host.css'

/** 主站只注入品牌、市场入口与示例备案；通用页面由固定模板包提供。 */
export const playoraTemplate:SiteTemplate={
 ...sourceTemplate,
 gitUrl:'https://github.com/weelume/playora-template',
 name:'微域生光 · 快乐学习',
 localizedNames:{en:'Weelume · Playful Learning'},
 surfaces:sourceTemplate.surfaces.map(surface=>({...surface,pages:surface.pages.map(page=>({...page,
  load:async()=>{const {default:Page}=await page.load();return {default:function WeelumePlayoraPage(props:SiteTemplatePageProps){
   return <PlayoraHostProvider brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-inverted.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling/>}><Page {...props}/><PageScrollbar className="template-scrollbar" controlsId="po-main" label={props.locale==='en'?'Page scroll':'页面滚动'} autoHide/></PlayoraHostProvider>
  }}}
 }))})),
}
