import {consutechTemplate as sourceTemplate} from 'consutech-template/template'
import {ConsutechHostProvider} from 'consutech-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'

export const consutechTemplate:SiteTemplate={
  ...sourceTemplate,
  name:'微域生光 · AI 企业咨询',
  localizedNames:{en:'Weelume · AI Business Consulting'},
  surfaces:sourceTemplate.surfaces.map(surface=>({...surface,pages:surface.pages.map(page=>({...page,load:async()=>{
    const {default:Page}=await page.load()
    return {default:function WeelumeConsutechPage(props:SiteTemplatePageProps){return <ConsutechHostProvider
      brandName={{zh:'微域生光',en:'Weelume'}}
      logo="/logo/weiyu-logo-web-dark.svg"
      lightLogo="/logo/weiyu-logo-inverted.svg"
      marketplaceHref="/templates"
      marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}}
      marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}}
      filing={<TemplateFiling/>}
    ><Page {...props}/></ConsutechHostProvider>}}
  }}))})),
}
