import {pawlioTemplate as sourceTemplate} from 'pawlio-template/template'
import {PawlioHostProvider} from 'pawlio-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'

/** 宿主只注入品牌、市场与备案，通用页面及动效由独立模板包维护。 */
export const pawlioTemplate:SiteTemplate={
  ...sourceTemplate,
  gitUrl:'https://github.com/weelume/pawlio-template',
  name:'Pawlio · 微域生光宠物美容',
  localizedNames:{en:'Pawlio · Weelume pet grooming'},
  surfaces:sourceTemplate.surfaces.map(surface=>({
    ...surface,
    pages:surface.pages.map(page=>({
      ...page,
      load:async()=>{
        const {default:Page}=await page.load()
        return {default:function WeelumePawlioPage(props:SiteTemplatePageProps){
          return <PawlioHostProvider
            brandName={{zh:'微域生光',en:'Weelume'}}
            logo="/logo/weiyu-logo-web-dark.svg"
            lightLogo="/logo/weiyu-logo-inverted.svg"
            marketplaceHref="/templates"
            marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}}
            marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}}
            filing={<TemplateFiling/>}
          ><Page {...props}/></PawlioHostProvider>
        }}
      },
    })),
  })),
}
