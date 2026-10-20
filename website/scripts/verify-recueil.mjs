/** 全页面、双语、四档视口与交互验收，使用项目现有 CDP 工具。 */
import assert from 'node:assert/strict'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { openBrowser, delay } from './lib/browser-cdp.mjs'
const origin=process.env.TEMPLATE_ORIGIN||'http://localhost:3000'
const root='/templates/recueil/site'
const output=new URL('../../artifacts/recueil-verification/',import.meta.url)
await mkdir(output,{recursive:true})
const report={pages:[],interactions:[],errors:[]}
const b=await openBrowser()
async function waitFor(expression,label){for(let i=0;i<200;i++){if(await b.evaluate(expression))return;await delay(100)}throw Error('Timeout: '+label)}
async function visit(path){await b.page('Page.navigate',{url:origin+path});await waitFor(`location.pathname===${JSON.stringify(path.split('?')[0].split('#')[0])}&&document.readyState==='complete'&&!!document.querySelector('.rc-footer')`,path);await delay(350)}
async function click(selector){await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(300)}
async function key(key,code=key,vk){await b.page('Input.dispatchKeyEvent',{type:'keyDown',key,code,...vk?{windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk}:{}});await b.page('Input.dispatchKeyEvent',{type:'keyUp',key,code,...vk?{windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk}:{}});await delay(250)}
const check=(condition,label)=>assert.ok(condition,label)
function errors(){return b.events.filter(e=>e.method==='Runtime.exceptionThrown'||e.method==='Log.entryAdded'&&e.params.entry.level==='error'||e.method==='Runtime.consoleAPICalled'&&e.params.type==='error').map(e=>e.params)}
try{
  await b.page('Page.bringToFront');await b.page('Log.enable')
  await b.page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  for(const [width,height] of [[1440,1000],[834,1180],[390,844],[320,844]]){
    await b.page('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
    for(const locale of ['zh','en'])for(const slug of ['','/privacy-policy','/404']){
      const path=root+(locale==='en'?'/en':'')+slug
      await visit(path)
      const result=await b.evaluate(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}));const h=document.querySelector('h1'),nav=document.querySelector('.rc-nav'),brand=document.querySelector('.rc-home-entry'),br=brand.getBoundingClientRect();return {width:innerWidth,locale:document.querySelector('.rc-site').dataset.locale,h1:document.querySelectorAll('h1').length,size:parseFloat(getComputedStyle(h).fontSize),font:getComputedStyle(h).fontFamily,overflow:document.documentElement.scrollWidth>innerWidth,badImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),clippedNav:[...nav.querySelectorAll('a,button')].filter(a=>a.getBoundingClientRect().width).some(a=>{const r=a.getBoundingClientRect();return r.left<0||r.right>innerWidth}),brandFont:parseFloat(getComputedStyle(nav.querySelector('.rc-brand')).fontSize),ctaFont:parseFloat(getComputedStyle(nav.querySelector('.rc-nav-cta')).fontSize),ctaHeight:nav.querySelector('.rc-nav-cta').getBoundingClientRect().height,containers:[...document.querySelectorAll('main .rc-container')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right}}),brand:{href:brand.getAttribute('href'),label:brand.getAttribute('aria-label'),height:br.height,textVisible:getComputedStyle(brand.querySelector('span')).display!=='none',bottom:innerHeight-br.bottom,right:innerWidth-br.right},arrows:document.querySelector('.rc-site').textContent.includes('↗'),body:document.querySelector('.rc-site').innerText}})()`)
      check(!result.overflow&&!result.clippedNav,`${path} ${width}: overflow/nav`)
      check(result.h1===1&&result.size>=28&&result.size<=44,`${path}: heading ${JSON.stringify(result)}`)
      check(result.badImages.length===0,`${path}: broken images ${result.badImages}`)
      check(result.containers.every(r=>r.left>=19&&r.right<=width-19),`${path}: margins`)
      check(result.font.includes('Weelume Poppins')&&result.font.includes('Weelume MiSans')&&result.locale===locale,`${path}: font/locale ${JSON.stringify({font:result.font,locale:result.locale})}`)
      check(result.brandFont===18&&result.ctaFont===13&&result.ctaHeight>=36,`${path}: navigation typography`)
      check(result.brand.href==='/templates'&&result.brand.height>=(width<=640?42:44)&&result.brand.textVisible===(width>640)&&result.brand.bottom>=14&&result.brand.right>=14,`${path}: brand button`)
      check(!result.arrows,`${path}: decorative arrows`)
      if(locale==='en')check(!/[\u4e00-\u9fff]/.test(result.body.replace(/微域生光|^中$|示例ICP备00000000号/gm,'')),`${path}: untranslated English text ${result.body.match(/[\u4e00-\u9fff]+/g)}`)
      delete result.body;report.pages.push({path,...result})
    }
    console.log('PASS pages',width)
  }
  await visit(root)
  await click('.rc-menu-toggle');check(await b.evaluate('document.querySelectorAll(".rc-mobile-menu a").length===7'),'mobile menu')
  await key('Escape','Escape',27);await waitFor('!document.querySelector(".rc-mobile-menu")','menu Escape')
  await click('.rc-menu-toggle');await click('.rc-mobile-menu a[href$="#library"]')
  check(await b.evaluate('location.hash==="#library"&&document.querySelector(".rc-menu-toggle").getAttribute("aria-expanded")==="false"'),'menu anchor navigation')
  report.interactions.push('手机菜单、Escape、锚点导航')
  for(let i=0;i<6;i++){
    await click(`#rc-material-${i}`)
    check(await b.evaluate(`document.querySelector('#rc-material-${i}').getAttribute('aria-selected')==='true'&&document.querySelector('#rc-material-panel').getAttribute('aria-labelledby')==='rc-material-${i}'`),'material '+i)
  }
  await b.evaluate('document.querySelector("#rc-material-5").focus()');await key('ArrowDown')
  check(await b.evaluate('document.querySelector("#rc-material-0").getAttribute("aria-selected")==="true"'),'palette keyboard loop')
  await key('End');check(await b.evaluate('document.querySelector("#rc-material-5").getAttribute("aria-selected")==="true"'),'palette End')
  report.interactions.push('六种原料切换、键盘方向键与首尾键')
  await click('.rc-faq-item:nth-child(1) button');check(await b.evaluate('document.querySelector("#rc-answer-0")!==null'),'FAQ open')
  await click('.rc-faq-item:nth-child(2) button');check(await b.evaluate('document.querySelectorAll(".rc-faq-item button[aria-expanded=true]").length===1&&!document.querySelector("#rc-answer-0")'),'FAQ single open')
  await click('.rc-faq-item:nth-child(2) button');check(await b.evaluate('!document.querySelector("#rc-answer-1")'),'FAQ close')
  report.interactions.push('FAQ 展开、切换与关闭')
  for(const id of ['monthly','bi-monthly','duo']){
    await click(`[data-plan="${id}"]`);check(await b.evaluate('document.querySelector("dialog").open&&document.activeElement.id==="rc-plan-name"'),'plan opens/focus '+id)
    await key('Escape','Escape',27);check(await b.evaluate(`!document.querySelector('dialog').open&&document.activeElement.dataset.plan==='${id}'`),'plan Escape/focus '+id)
  }
  await click('[data-plan="monthly"]');await click('.rc-dialog button[type=submit]')
  check(await b.evaluate('document.querySelector("#rc-plan-result").textContent.includes("请填写")'),'form required validation')
  const requestStart=b.events.length
  await b.evaluate(`{const form=document.querySelector('.rc-dialog form');form.elements.name.value='Demo Guest';form.elements.email.value='demo@example.com';form.elements.consent.checked=true;form.requestSubmit()}`);await delay(200)
  check(await b.evaluate('document.querySelector("#rc-plan-result").textContent.includes("未发送或保存")'),'honest local success')
  await click('.rc-dialog-close');await click('.rc-newsletter-form button')
  check(await b.evaluate('document.querySelector("#rc-letter-email").getAttribute("aria-invalid")==="true"'),'newsletter invalid')
  await b.evaluate(`document.querySelector('#rc-letter-email').value='demo@example.com';document.querySelector('.rc-newsletter-form').requestSubmit()`);await delay(200)
  check(await b.evaluate('document.querySelector("#rc-letter-result").textContent.includes("尚未发送")'),'newsletter local success')
  check(!b.events.slice(requestStart).some(e=>e.method==='Network.requestWillBeSent'&&e.params.request.method==='POST'),'no form POST')
  check(await b.evaluate('localStorage.length===0&&sessionStorage.length===0'),'no form storage')
  report.interactions.push('三种方案弹窗、焦点与 Escape、表单错误/成功提示、无 POST 或存储')
  await visit(root+'/privacy-policy?from=verification#policy-3')
  await b.evaluate('window.__recueilMarker=true');await click('.rc-language')
  await waitFor(`location.pathname==='${root}/en/privacy-policy'&&!!document.querySelector('.rc-site[data-locale=en]')`,'English route')
  check(await b.evaluate('location.search==="?from=verification"&&location.hash==="#policy-3"&&window.__recueilMarker'),'language preserves client session/query/hash')
  await click('.rc-language');await waitFor(`location.pathname==='${root}/privacy-policy'`,'Chinese route')
  check(await b.evaluate('location.search==="?from=verification"&&location.hash==="#policy-3"'),'Chinese query/hash')
  await visit(root+'/en');await click('[data-plan="monthly"]');await click('.rc-dialog button[type=submit]')
  check(await b.evaluate('document.querySelector("#rc-plan-result").textContent.includes("Enter your name")'),'English form error')
  await click('.rc-dialog-close');await click('.rc-footer-bottom a[href$="/404"]');await waitFor(`location.pathname==='${root}/en/404'`,'404 route')
  await click('.rc-not-found .rc-button');await waitFor(`location.pathname==='${root}/en'`,'404 return')
  report.interactions.push('双向语言切换保留页面/参数/锚点、英文表单、隐私与 404 客户端路由')
  check(await b.evaluate('document.querySelector("video").paused&&getComputedStyle(document.querySelector("video")).display==="none"'),'reduced motion video')
  await b.page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
  await waitFor('!document.querySelector("video").paused','hero video playback')
  await b.page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await waitFor('document.querySelector("video").paused','reduced motion pause')
  report.interactions.push('首屏本地视频播放与减少动态效果暂停')
  await b.evaluate('window.__recueilMarketMarker=true');await click('.rc-home-entry')
  await waitFor('location.pathname==="/templates"','market navigation');check(await b.evaluate('window.__recueilMarketMarker'),'market client navigation')
  await b.page('Page.navigate',{url:origin+'/templates/recueil'})
  await waitFor('document.querySelectorAll(".market-page-link").length===3','market pages')
  check(await b.evaluate(`!!document.querySelector('a[href="${root}"][target="_blank"]')`),'new tab preview')
  report.interactions.push('品牌按钮客户端跳转、模板详情 3 页清单与新标签页预览')
  for(const [device,width] of [['tablet',834],['mobile',390]]){
    await b.page('Page.navigate',{url:`${origin}/templates/recueil/preview?viewport=${device}`})
    await waitFor(`(()=>{const d=document.querySelector('iframe')?.contentDocument;return d?.readyState==='complete'&&!!d.querySelector('.rc-footer')&&document.querySelector('iframe').contentWindow.innerWidth===${width}})()`,'device frame '+device)
    await delay(1300)
    check(await b.evaluate(`document.querySelector('iframe').contentDocument.documentElement.scrollWidth<=${width}`),'frame overflow '+device)
    await b.evaluate('document.querySelector("iframe").contentDocument.querySelector(".rc-menu-toggle").click()');await delay(300)
    check(await b.evaluate('document.querySelector("iframe").contentDocument.querySelector(".rc-menu-toggle").getAttribute("aria-expanded")==="true"'),'frame menu '+device)
  }
  report.interactions.push('iPad/H5 真实 CSS 视口、无溢出与框内菜单')
  const sources=JSON.parse(await readFile(new URL('../public/templates/recueil/sources.json',import.meta.url),'utf8'))
  for(const item of sources.assets){const bytes=await readFile(new URL('../public'+item.file,import.meta.url));check(createHash('sha256').update(bytes).digest('hex')===item.sha256,'asset SHA256 '+item.file)}
  report.interactions.push(`${sources.assets.length} 个本地素材 SHA256 校验`)
  report.errors=errors();check(report.errors.length===0,'browser errors: '+JSON.stringify(report.errors).slice(0,3000))
  console.log(`PASS ${report.pages.length} page combinations; ${report.interactions.length} interaction groups; no browser errors`)
}finally{report.errors=errors();await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await b.close()}
