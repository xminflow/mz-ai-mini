import type { SiteTemplate, TemplateScreenshot } from '../../types'

const screenshots:TemplateScreenshot[]=(['desktop','tablet','mobile'] as const).flatMap(device=>{
  const [width,height]=device==='desktop'?[1440,1000]:device==='tablet'?[834,1180]:[390,844]
  return [['home','首页'],['library','香氛库'],['stories','香气故事'],['contact','联系与订阅']].map(([page,label])=>({src:`/templates/recueil/screenshots/${device}-${page}.webp`,alt:`${device} ${label}真实页面截图`,device,width,height}))
})
export const recueilTemplate:SiteTemplate={
  id:'recueil',name:'微域生光 · 香氛订阅',localizedNames:{en:'Weelume · Fragrance atelier'},sceneId:'corporate-site',listed:false,
  tags:['香氛订阅','蓝紫微光','玻璃卡片','双语整站','PC / iPad / H5'],
  summary:'参考 Recueil 的蓝紫色香氛视觉与长页叙事，覆盖完整首页、隐私说明和 404 页面。包含香氛库、六种原料切换、故事、三种订阅方案、FAQ 及本地表单演示，统一微域生光品牌与中英文排版。源站素材仅供内部预览，商用前需授权或替换。',
  accentColor:'#bae6fd',cover:'/templates/recueil/screenshots/desktop-home.webp',screenshots:screenshots as [TemplateScreenshot,...TemplateScreenshot[]],
  surfaces:[{id:'site',name:'香氛订阅官网',platform:'pc',locales:['zh','en'],pages:[
    {slug:'',title:'首页',localizedTitles:{en:'Home'},load:()=>import('./pages/HomePage')},
    {slug:'privacy-policy',title:'隐私说明',localizedTitles:{en:'Privacy notice'},load:()=>import('./pages/PrivacyPage')},
    {slug:'404',title:'404 页面',localizedTitles:{en:'Page not found'},load:()=>import('./pages/NotFoundPage')},
  ]}],
}
