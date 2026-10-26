import {stocklensTemplate as sourceTemplate} from 'stocklens-template/template'
import {StockLensHostProvider} from 'stocklens-template/host'
import {TemplateFiling} from '../../shared/TemplateFiling'
import type {SiteTemplate,SiteTemplatePageProps} from '../../types'
/** 宿主仅注入品牌、市场入口和示例备案，业务源码保留在独立模板包。 */
export const stocklensTemplate:SiteTemplate={...sourceTemplate,name:'StockLens · 微域生光美股分析',localizedNames:{en:'StockLens · Weelume US Stock Analysis'},surfaces:sourceTemplate.surfaces.map(surface=>({...surface,pages:surface.pages.map(page=>({...page,load:async()=>{const{default:Page}=await page.load();return{default:function WeelumeStockLensPage(props:SiteTemplatePageProps){return <StockLensHostProvider brandName={{zh:'微域生光',en:'Weelume'}} logo="/logo/weiyu-logo-web-dark.svg" lightLogo="/logo/weiyu-logo-inverted.svg" marketplaceHref="/templates" marketplaceLabel={{zh:'微域生光：模板市场',en:'Weelume: template marketplace'}} marketplaceAriaLabel={{zh:'打开微域生光模板市场',en:'Open Weelume template marketplace'}} filing={<TemplateFiling/>}><Page {...props}/></StockLensHostProvider>}}}}))}))}
