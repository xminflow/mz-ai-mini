import assert from 'node:assert/strict'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'
const origin=process.env.TEMPLATE_ORIGIN||'http://localhost:3000'
const output=new URL('../../artifacts/template-scrollbars/',import.meta.url)
await mkdir(output,{recursive:true})
const previous=process.env.TEMPLATE_FILINGS_ONLY?JSON.parse(await readFile(new URL('report.json',output),'utf8')):{scrollbars:[]}
const b=await openBrowser(),report={scrollbars:previous.scrollbars,filings:[],errors:[],existingWarnings:[]}
const check=(condition,label)=>assert.ok(condition,label)
async function waitFor(expression,label){for(let i=0;i<200;i++){if(await b.evaluate(expression))return;await delay(100)}throw Error('Timeout: '+label)}
async function key(name,vk){await b.page('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:vk});await b.page('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:vk});await delay(150)}
async function state(){return b.evaluate(`(()=>{const r=document.querySelector('.template-scrollbar'),t=r.querySelector('.template-scrollbar-thumb'),rr=r.getBoundingClientRect(),tr=t.getBoundingClientRect();return{width:innerWidth,pageWidth:document.documentElement.clientWidth,gutter:getComputedStyle(document.documentElement).scrollbarGutter,native:getComputedStyle(document.documentElement).scrollbarWidth,overflow:document.documentElement.scrollWidth>innerWidth,y:scrollY,max:document.documentElement.scrollHeight-innerHeight,now:Number(r.getAttribute('aria-valuenow')),ariaMax:Number(r.getAttribute('aria-valuemax')),active:r.dataset.active,opacity:getComputedStyle(r).opacity,dragging:r.dataset.dragging,track:{x:rr.x,y:rr.y,width:rr.width,height:rr.height},thumb:{x:tr.x,y:tr.y,width:tr.width,height:tr.height},color:getComputedStyle(t).backgroundColor}})()`)}
function sync(s){check(s.now===Math.round(s.y)&&s.ariaMax===s.max,'aria sync');check(Math.abs(s.thumb.y-s.track.y-s.y/s.max*(s.track.height-s.thumb.height))<1,'thumb position sync')}
try{
 await b.page('Page.bringToFront');await b.page('Log.enable')
 for(const template of (process.env.TEMPLATE_FILINGS_ONLY?[]:['recueil','noirei'])){
  for(const [width,height] of [[1440,1000],[834,1180],[390,844],[320,844]]){
   await b.page('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
   await b.page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
   await b.page('Page.navigate',{url:`${origin}/templates/${template}/site`})
   await waitFor(`document.querySelector('.template-scrollbar')?.dataset.scrollable==='true'&&document.readyState==='complete'`,'ready '+template)
   await b.evaluate('document.fonts.ready');await delay(300)
   let s=await state();check(s.width===s.pageWidth&&s.gutter==='auto'&&s.native==='none'&&!s.overflow,`${template} ${width} no gutter`);sync(s)
   await b.page('Input.dispatchMouseEvent',{type:'mouseMoved',x:width/2,y:height/2})
   await b.page('Input.dispatchMouseEvent',{type:'mouseWheel',x:width/2,y:height/2,deltaX:0,deltaY:500});await delay(300)
   s=await state();check(s.y>100&&s.opacity==='1','wheel visible');sync(s)
   await delay(1600);s=await state();check(s.opacity==='0','idle hides')
   // 先悬停让细滑块显现，再用真实指针验证拖动，而非脚本改写滚动位置。
   const x=width-7,y=s.thumb.y+s.thumb.height/2
   await b.page('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});await delay(250)
   await b.page('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1})
   await delay(100)
   const end=s.track.y+s.track.height*.7
   for(let i=1;i<=8;i++){await b.page('Input.dispatchMouseEvent',{type:'mouseMoved',x,y:y+(end-y)*i/8,button:'left',buttons:1});await delay(20)}
   await b.page('Input.dispatchMouseEvent',{type:'mouseReleased',x,y:end,button:'left',buttons:0,clickCount:1});await delay(200)
   s=await state();check(s.y>s.max*.5&&s.dragging==='false','pointer drag '+JSON.stringify(s));sync(s)
   await b.evaluate('document.querySelector(".template-scrollbar").focus({preventScroll:true})')
   await key('End',35);s=await state();check(Math.abs(s.max-s.y)<2,'End reaches bottom');sync(s)
   await key('Home',36);check((await state()).y===0,'Home reaches top')
   await key('PageDown',34);check((await state()).y>height*.8,'PageDown scrolls')
   if(width<=390){
    await b.page('Emulation.setTouchEmulationEnabled',{enabled:true})
    await b.evaluate('scrollTo({top:0,behavior:"instant"})');await delay(100)
    await b.page('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width/2,y:height*.75}]})
    for(let i=1;i<=6;i++){await b.page('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width/2,y:height*(.75-.4*i/6)}]});await delay(40)}
    await b.page('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(300)
    check((await state()).y>100,'touch content scroll')
    await b.page('Emulation.setTouchEmulationEnabled',{enabled:false})
   }
   report.scrollbars.push({template,width,height,noGutter:true,wheel:true,drag:true,keyboard:true,idleHides:true,touch:width<=390,color:s.color})
   console.log('PASS scrollbar',template,width)
  }
  await b.page('Page.navigate',{url:`${origin}/templates/${template}/site/en`})
  await waitFor(`document.readyState==='complete'&&document.querySelector('.template-scrollbar')?.getAttribute('aria-label')==='Page scroll'&&document.querySelector('.template-scrollbar')?.dataset.scrollable==='true'`,'English scrollbar label')
  await delay(500)
  const modalSelector=template==='recueil'?'[data-plan="monthly"]':'.nr-gallery-stage'
  await b.evaluate(`document.querySelector(${JSON.stringify(modalSelector)})?.click()`)
  {
   await waitFor('document.querySelector("dialog[open]")!==null','template dialog')
   check(await b.evaluate('getComputedStyle(document.querySelector(".template-scrollbar")).pointerEvents==="none"'),'modal disables scrollbar')
   await b.evaluate('document.querySelector("dialog[open]").close()')
  }
  await b.evaluate(`document.querySelector('.${template==='recueil'?'rc':'nr'}-home-entry').click()`)
  await waitFor('location.pathname==="/templates"','leave template')
  check(await b.evaluate('getComputedStyle(document.documentElement).scrollbarWidth!=="none"&&getComputedStyle(document.documentElement).scrollbarGutter==="stable"'),'host scroll restored')
 }
 for(const template of ['lunera','grovia','nubo','studiothink','deformo','unseen','tabfolio','hellomonday','noirei','recueil']){
  await b.page('Page.navigate',{url:`${origin}/templates/${template}/site`})
  await waitFor('document.readyState==="complete"&&!!document.querySelector("[data-template-filing]")','filing '+template)
  check(await b.evaluate('document.querySelector("[data-template-filing]").textContent==="示例ICP备00000000号"&&document.querySelector("[data-template-filing]").tagName==="SPAN"&&!document.body.innerText.includes("鄂ICP备2026022946号")&&![...document.links].some(a=>a.href.includes("beian.miit"))'),'demo filing '+template)
  report.filings.push({template,demo:true,noOfficialLink:true})
  console.log('PASS demo filing',template)
 }
 await b.page('Page.navigate',{url:origin+'/'})
 await waitFor('document.readyState==="complete"&&!!document.querySelector("footer")','host footer')
 check(await b.evaluate('[...document.links].some(a=>a.href==="https://beian.miit.gov.cn/")&&document.body.innerText.includes("鄂ICP备2026022946号")'),'real host filing preserved')
 report.errors=b.events.filter(e=>e.method==='Runtime.exceptionThrown'||e.method==='Log.entryAdded'&&e.params.entry.level==='error'||e.method==='Runtime.consoleAPICalled'&&e.params.type==='error').map(e=>e.params)
 report.existingWarnings=report.errors.filter(e=>e.args?.some(a=>typeof a.value==='string'&&a.value.includes('LuneraShell')))
 const unexpected=report.errors.filter(e=>!report.existingWarnings.includes(e))
 check(unexpected.length===0,'browser errors '+JSON.stringify(unexpected).slice(0,1500))
 console.log(`PASS ${report.scrollbars.length} scrollbar cases, ${report.filings.length} template filings, host restored; ${report.existingWarnings.length} existing Lunera reduced-motion hydration warning(s), no unexpected browser errors`)
}finally{report.errors=b.events.filter(e=>e.method==='Runtime.exceptionThrown'||e.method==='Log.entryAdded'&&e.params.entry.level==='error'||e.method==='Runtime.consoleAPICalled'&&e.params.type==='error').map(e=>e.params);await writeFile(new URL('report.json',output),JSON.stringify(report,null,2));await b.close()}
