/** 对照修正验收：双语、三端、真实媒体、交互和关联页面。 */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'
const base=process.env.VIRAL_PREVIEW_URL || 'http://localhost:3000'
const output=new URL('../../artifacts/viral-comparison/',import.meta.url)
await mkdir(output,{recursive:true})
const browser=await openBrowser()
const checks=[]
const navigate=async path=>{
  await browser.page('Page.navigate',{url:base+'/templates/viral/site'+path})
  let ready=false
  for(let i=0;i<150;i++){
    ready=await browser.evaluate(`document.readyState!=='loading' && !!document.querySelector('.vl-footer') && !!document.querySelector('h1') && location.pathname===${JSON.stringify('/templates/viral/site'+path)}`)
    if(ready)break
    await delay(200)
  }
  assert(ready,`页面 DOM 未就绪: ${path}`)
  await browser.evaluate('document.fonts.ready')
  await delay(1400)
}
const capture=async name=>{const s=await browser.page('Page.captureScreenshot',{format:'png'});await writeFile(new URL(name+'.png',output),Buffer.from(s.data,'base64'))}
try {
  for(const [device,width,height] of [['desktop',1440,1000],['tablet',834,1180],['mobile',390,844]]){
    await browser.page('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
    for(const locale of ['en','zh']){
      await navigate(locale==='en'?'/en':'')
      const result=await browser.evaluate(`(async()=>{
        document.querySelector('nextjs-portal')?.setAttribute('style','display:none');
        await Promise.all([...document.images].map(i=>i.decode().catch(()=>null)));
        const title=document.querySelector('.vl-hero h1');
        return {overflow:document.documentElement.scrollWidth>innerWidth,font:getComputedStyle(title).fontFamily,size:parseFloat(getComputedStyle(title).fontSize),broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),videos:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,error:v.error?.message,ready:v.readyState})),faq:[...document.querySelectorAll('.vl-faq-item button')].map(b=>b.getAttribute('aria-expanded')),oldBrand:/viral/i.test(document.body.innerText+' '+document.title),brandLabels:[...document.querySelectorAll('.vl-brand')].map(e=>e.innerText),brandIcons:[...document.querySelectorAll('.vl-mark img')].map(e=>e.getAttribute('src'))}
      })()`)
      assert.equal(result.overflow,false,`${device}/${locale}: 横向溢出`)
      assert.equal(result.broken.length,0,JSON.stringify(result.broken))
      assert(result.font.includes('Viral Inter'))
      assert.equal(result.size,locale==='en'?(width===1440?100:width===834?80:48):(width===390?36:72))
      assert(result.videos.every(v=>!v.error && v.ready>=2),JSON.stringify(result.videos))
      assert(result.faq.every(v=>v==='false'))
      assert.equal(result.oldBrand,false,'页面残留旧品牌')
      assert(result.brandLabels.every(v=>v==='微域生光'))
      assert(result.brandIcons.length>=5 && result.brandIcons.every(v=>v==='/logo/weiyu-logo-web-light.svg'))
      const interaction=await browser.evaluate(`(async()=>{
        document.querySelector('.vl-video-top button:nth-child(2)').click();
        await new Promise(r=>setTimeout(r,200));
        const videoSelected=document.querySelectorAll('.vl-video-stack video')[1].classList.contains('is-active');
        const otherPaused=[...document.querySelectorAll('.vl-video-stack video')].filter((v,i)=>i!==1).every(v=>v.paused);
        const faq=document.querySelector('.vl-faq-item button');faq.click();await new Promise(r=>setTimeout(r,400));const opened=faq.getAttribute('aria-expanded')==='true' && !!document.querySelector('.vl-faq-answer');faq.click();
        return {videoSelected,otherPaused,opened};
      })()`)
      assert(Object.values(interaction).every(Boolean),JSON.stringify(interaction))
      await capture(`after-${device}-${locale}-hero`)
      for(const section of ['.vl-service-grid','.vl-testimonial','.vl-faq','.vl-cta']){
        await browser.evaluate(`document.querySelector(${JSON.stringify(section)}).scrollIntoView({block:'center',behavior:'instant'})`)
        await delay(1000)
        await capture(`after-${device}-${locale}-${section.slice(4)}`)
      }
      if(width===390){
        const menu=await browser.evaluate(`(async()=>{const b=document.querySelector('.vl-menu-toggle');b.click();await new Promise(r=>setTimeout(r,300));return b.getAttribute('aria-expanded')==='true'&&document.querySelectorAll('.vl-mobile-menu a').length>=6})()`)
        assert(menu,'移动导航没有展开')
      }
      checks.push({device,locale,...result,interaction})
      console.log('PASS',device,locale)
    }
  }
  for(const locale of ['en','zh']) for(const route of ['/about','/case-studies','/blog','/blog/short-form-playbook','/book-a-call','/privacy-policy','/terms-of-service','/404']){
    await navigate((locale==='en'?'/en':'')+route)
    const result=await browser.evaluate(`({title:document.querySelector('h1')?.innerText,overflow:document.documentElement.scrollWidth>innerWidth,oldBrand:/viral/i.test(document.body.innerText+' '+document.title),brandLabels:[...document.querySelectorAll('.vl-brand')].map(e=>e.innerText)})`)
    assert(result.title,route);assert.equal(result.overflow,false,route)
    assert.equal(result.oldBrand,false,locale+route+'残留旧品牌');assert(result.brandLabels.every(v=>v==='微域生光'))
    checks.push({locale,route,...result})
  }
  const errors=browser.events.filter(e=>e.method==='Runtime.exceptionThrown')
  assert.equal(errors.length,0,JSON.stringify(errors))
  await writeFile(new URL('verification.json',output),JSON.stringify({checkedAt:new Date().toISOString(),checks,runtimeExceptions:errors},null,2)+'\n')
} finally {await browser.close()}
