import Link from 'next/link'
import {newcomerTemplate as sourceTemplate} from 'newcomer-template/template'
import {NewcomerHostProvider} from 'newcomer-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'

export const newcomerTemplate:SiteTemplate={
  ...sourceTemplate,
  gitUrl:'https://github.com/weelume/newcomer-template',
  name:'Newcomer · 微域生光随身 AI 助手',
  localizedNames:{en:'Newcomer · Weelume AI Companion'},
  surfaces:sourceTemplate.surfaces.map(surface=>({...surface,pages:surface.pages.map(page=>({...page,load:async()=>{
    const {default:Page}=await page.load()
    return {default:function WeelumeNewcomerPage(props:SiteTemplatePageProps){
      const english=props.locale==='en'
      return <NewcomerHostProvider brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-inverted.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<><Link href="/templates">{english?'Weelume: template marketplace':'微域生光：模板市场'}</Link><TemplateFiling/></>}><Page {...props}/></NewcomerHostProvider>
    }}
  }}))})),
}
