import { createElement } from 'react'
import type { SiteTemplate, SiteTemplatePageProps, TemplateScreenshot } from '../../types'
import { articles, projects } from './data'

const shots: TemplateScreenshot[] = (['desktop','tablet','mobile'] as const).flatMap(device=>{
  const [width,height]=device==='desktop'?[1440,1000]:device==='tablet'?[834,1180]:[390,844]
  return [['home','首页'],['services','服务'],['stories','故事'],['contact','联系']].map(([page,label])=>({src:`/templates/hellomonday/screenshots/${device}-${page}.webp`,alt:`${device} ${label}真实页面截图`,device,width,height}))
})
export const hellomondayTemplate: SiteTemplate = {
  id:'hellomonday', name:'微域生光 · 黑白创意工作室', localizedNames:{en:'Weelume · Playful creative studio'},
  sceneId:'brand-portfolio', listed:false,
  tags:['黑白手绘','错落作品网格','创意工作室','双语整站','PC / iPad / H5'],
  summary:'参考 Hello Monday 的黑白手绘、弧形菜单与错落作品布局，按项目标准使用微域生光品牌与本地 MiSans / Poppins 字体。包含首页、作品、服务、关于、故事、产品、联系、求职与实习、政策，以及 70 个案例解读和 7 篇故事。支持双语路径、搜索筛选、影像预览与本地表单校验。原站素材仅限内部预览，正式交付前须取得许可或替换。',
  accentColor:'#b9b0ed', cover:'/templates/hellomonday/screenshots/desktop-home.webp',
  screenshots:shots as [TemplateScreenshot,...TemplateScreenshot[]],
  surfaces:[{id:'site',name:'创意工作室官网',platform:'pc',locales:['zh','en'],pages:[
    {slug:'',title:'首页',localizedTitles:{en:'Home'},load:()=>import('./pages/HomePage')},
    {slug:'work',title:'作品',localizedTitles:{en:'Work'},load:()=>import('./pages/WorkPage')},
    {slug:'services',title:'服务',localizedTitles:{en:'Services'},load:()=>import('./pages/ServicesPage')},
    {slug:'about',title:'关于',localizedTitles:{en:'About'},load:()=>import('./pages/AboutPage')},
    {slug:'stories',title:'故事',localizedTitles:{en:'Stories'},load:()=>import('./pages/StoriesPage')},
    {slug:'product',title:'产品合作',localizedTitles:{en:'Product partnerships'},load:()=>import('./pages/ProductPage')},
    {slug:'contact',title:'联系',localizedTitles:{en:'Contact'},load:()=>import('./pages/ContactPage')},
    ...(['careers','internship'] as const).map(slug=>({slug,title:slug==='careers'?'加入我们':'实习机会',localizedTitles:{en:slug==='careers'?'Careers':'Internships'},load:async()=>{
      const {default:Page}=await import('./pages/ContactPage')
      return {default:(props:SiteTemplatePageProps)=>createElement(Page,{...props,kind:slug==='careers'?'career':'internship'})}
    }})),
    ...projects.map(project=>({slug:`work/${project.id}`,title:project.name[0],localizedTitles:{en:project.name[1]},load:async()=>{
      const {default:Page}=await import('./pages/ProjectPage')
      // 复用模板内的服务端页面壳，动态案例不改动全局 catch-all 路由接口。
      return {default:(props:SiteTemplatePageProps)=>createElement(Page,{...props,projectId:project.id})}
    }})),
    ...articles.map(article=>({slug:`stories/${article.id}`,title:article.title[0],localizedTitles:{en:article.title[1]},load:async()=>{
      const {default:Page}=await import('./pages/StoryPage')
      return {default:(props:SiteTemplatePageProps)=>createElement(Page,{...props,storyId:article.id})}
    }})),
    ...(['privacy','terms'] as const).map(kind=>({slug:kind,title:kind==='privacy'?'隐私说明':'使用条款',localizedTitles:{en:kind==='privacy'?'Privacy':'Terms'},load:async()=>{
      const {default:Page}=await import('./pages/PolicyPage')
      return {default:(props:SiteTemplatePageProps)=>createElement(Page,{...props,kind})}
    }})),
  ]}],
}
