import {estaymartTemplate as sourceTemplate} from 'estaymart-template/template'
import {EstaymartHostProvider} from 'estaymart-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'

export const estaymartTemplate:SiteTemplate={
  ...sourceTemplate,
  name:'微域生光 · 自然理想居所',
  localizedNames:{en:'Weelume · Sustainable Living'},
  surfaces:sourceTemplate.surfaces.map(surface=>({
    ...surface,
    pages:surface.pages.map(page=>({
      ...page,
      load:async()=>{
        const {default:Page}=await page.load()
        return {default:function WeelumeEstaymartPage(props:SiteTemplatePageProps){
          return <EstaymartHostProvider
            brandName={{zh:'微域生光',en:'Weelume'}}
            logo="/logo/weiyu-logo-web-dark.svg"
            lightLogo="/logo/weiyu-logo-inverted.svg"
            marketplaceHref="/templates"
            marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}}
            marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}}
            filing={<TemplateFiling/>}
          ><Page {...props}/></EstaymartHostProvider>
        }}
      },
    })),
  })),
}
