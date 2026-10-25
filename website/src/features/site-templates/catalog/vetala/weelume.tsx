import {vetalaTemplate as sourceTemplate} from 'vetala-template/template'
import {VetalaHostProvider} from 'vetala-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'

/** 页面、文案、动效与素材均由独立模板提供，宿主保持最小注入边界。 */
export const vetalaTemplate:SiteTemplate={
 ...sourceTemplate,
 gitUrl:'https://github.com/weelume/vetala-template',
 name:'Vetala · 微域生光 AI 营销员工',
 localizedNames:{en:'Vetala · Weelume AI marketing employees'},
 surfaces:sourceTemplate.surfaces.map(surface=>({...surface,pages:surface.pages.map(page=>({...page,load:async()=>{
  const {default:Page}=await page.load()
  return {default:function WeelumeVetalaPage(props:SiteTemplatePageProps){return <VetalaHostProvider
   brandName={{zh:'微域生光',en:'Weelume'}}
   logo="/logo/weiyu-logo-web-dark.svg"
   lightLogo="/logo/weiyu-logo-inverted.svg"
   marketplaceHref="/templates"
   marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}}
   marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}}
   filing={<TemplateFiling/>}
  ><Page {...props}/></VetalaHostProvider>}}
 }}))})),
}
