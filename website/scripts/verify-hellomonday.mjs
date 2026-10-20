/** 真实 Chrome / CDP 验收；复用仓库工具，不安装新依赖。 */
import assert from 'node:assert/strict'
import {mkdir,readFile,writeFile,stat} from 'node:fs/promises'
import {openBrowser,delay} from './lib/browser-cdp.mjs'
import {prepareHelloMondayMotion} from './lib/hellomonday-motion.mjs'
const root=new URL('../',import.meta.url)
const base=process.env.HELLOMONDAY_PREVIEW_URL||'http://localhost:3000'
const site='/templates/hellomonday/site'
const output=new URL('public/templates/hellomonday/screenshots/',root)
const data=JSON.parse(await readFile(new URL('src/features/site-templates/catalog/hellomonday/source-data.json',root),'utf8'))
const animations=JSON.parse(await readFile(new URL('src/features/site-templates/catalog/hellomonday/animated-images.json',root),'utf8'))
await mkdir(output,{recursive:true})
const report={base,checkedAt:new Date().toISOString(),checks:[],routes:[],screenshots:[],consoleErrors:[]}
const check=(name,actual,expected=true)=>{assert.deepEqual(actual,expected,name);report.checks.push({name,passed:true});console.log('PASS',name)}
const b=await openBrowser()
const wait=async expression=>{for(let i=0;i<180;i++){if(await b.evaluate(expression))return;await delay(100)}throw new Error(`Timed out: ${expression}`)}
const click=selector=>b.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
async function navigate(path){
  const result=await b.page('Page.navigate',{url:base+path})
  if(result.errorText)throw new Error(result.errorText)
  await wait(`location.pathname===${JSON.stringify(path.split('?')[0].split('#')[0])}&&document.readyState==='complete'&&!!document.querySelector('.hm-footer,.market-footer')`)
  await b.evaluate(`(async()=>{await document.fonts.ready;document.querySelector('nextjs-portal')?.setAttribute('style','display:none');window.scrollTo({top:0,behavior:'instant'})})()`)
  await wait(`!document.querySelector('.hm-menu-button')||Object.keys(document.querySelector('.hm-menu-button')).some(k=>k.startsWith('__reactProps$'))`)
  const exceptions=b.events.filter(e=>e.method==='Runtime.exceptionThrown')
  if(exceptions.length)throw new Error(`Browser exception at ${path}: ${JSON.stringify(exceptions.map(e=>e.params.exceptionDetails))}`)
  const errors=b.events.filter(e=>e.method==='Runtime.consoleAPICalled'&&e.params.type==='error')
  if(errors.length)throw new Error(`Browser console error at ${path}: ${JSON.stringify(errors.map(e=>e.params.args))}`)
}
const metrics=()=>b.evaluate(`({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,heading:document.querySelector('h1')?.innerText,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))})`)
const mainPages=['','/work','/services','/about','/stories','/product','/contact','/careers','/internship','/privacy','/terms',`/work/${data.projects[0].id}`,`/stories/${data.articles[0].id}`]
const screenshots=new Map([['','home'],['/services','services'],['/stories','stories'],['/contact','contact']])
try {
  await b.page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await navigate(site)
  // 从已经本地化的原始媒体生成静态帧，减少动态偏好不再播放 GIF 或自动视频。
  await prepareHelloMondayMotion(b,root,data,animations)
  const allFiles=[data.extras.hero,data.extras.productHero,...data.extras.services,...data.projects.flatMap(p=>[p.image,p.landscape,...p.gallery]),...data.articles.flatMap(a=>a.gallery),...data.team.flatMap(p=>p.images)]
  for(const file of new Set(allFiles)){const info=await stat(new URL(`public${file}`,root));assert.ok(info.size>0,`Empty media: ${file}`)}
  check('All referenced media are nonempty local files',allFiles.every(src=>src.startsWith('/templates/hellomonday/')))
  for(const device of [{id:'desktop',width:1440,height:1000},{id:'tablet',width:834,height:1180},{id:'mobile',width:390,height:844},{id:'narrow',width:320,height:844}]) {
    await b.page('Emulation.setDeviceMetricsOverride',{width:device.width,height:device.height,deviceScaleFactor:1,mobile:false})
    for(const locale of ['','/en']) {
      for(const path of mainPages) {
        await navigate(`${site}${locale}${path}`)
        // 不修改 React 管理的 loading 属性：Suspense 子树可能晚于页面导航壳完成水合。
        const broken=await b.evaluate(`(async()=>{return (await Promise.all([...document.images].map(async i=>{const probe=new Image();probe.src=i.currentSrc||i.src;try{await probe.decode();return null}catch{return i.getAttribute('src')}}))).filter(Boolean)})()`)
        check(`${device.id}${locale}${path||'/'} images`,broken,[])
        const result=await metrics()
        check(`${device.id}${locale}${path||'/'} no overflow`,!result.overflow)
        assert.ok(result.heading,`Missing heading: ${path}`)
        if(path==='/product') {
          // 在实际承载深色令牌的容器上核对文字继承，避免只检查变量而遗漏黑底黑字。
          const theme=await b.evaluate(`(()=>{
            const selectors=['.hm-header .hm-brand','.hm-jump a','h1','.hm-product-intro p:first-child','#collaborations h2','.hm-partners strong','.hm-quotes blockquote','.hm-quote-controls button','#ready h2','#ready a'];
            const dark=getComputedStyle(document.querySelector('.hm-site')).color;
            return {dark,text:selectors.map(s=>({selector:s,color:getComputedStyle(document.querySelector(s)).color})),footer:getComputedStyle(document.querySelector('.hm-footer')).color};
          })()`)
          check(`${device.id}${locale} product dark text inherits theme`,theme.text.every(item=>item.color==='rgb(255, 255, 255)')&&theme.dark==='rgb(255, 255, 255)')
          check(`${device.id}${locale} product light footer keeps dark text`,theme.footer,'rgb(21, 21, 21)')
          const footer=await b.evaluate(`(()=>{const f=document.querySelector('.hm-footer'),r=f.getBoundingClientRect(),gutter=parseFloat(getComputedStyle(f).paddingLeft);return {width:r.width,gutter,blocks:[...f.children].map(e=>{const b=e.getBoundingClientRect();return {width:b.width,center:b.x+b.width/2}})}})()`)
          check(`${device.id}${locale} footer uses reference margins and centered container`,Math.abs(footer.gutter-Math.max(24,footer.width*.048828125))<.1&&footer.blocks.every(block=>Math.abs(block.width-Math.min(1670,footer.width-2*footer.gutter))<.1&&Math.abs(block.center-footer.width/2)<.1))
        }
        if(device.id!=='narrow'&&!locale&&screenshots.has(path)) {
          await delay(150)
          const shot=await b.page('Page.captureScreenshot',{format:'webp',quality:88,captureBeyondViewport:false})
          const file=`${device.id}-${screenshots.get(path)}.webp`
          await writeFile(new URL(file,output),Buffer.from(shot.data,'base64'))
          report.screenshots.push({file,path,width:device.width,height:device.height})
        }
      }
    }
    await navigate(site)
    await click('.hm-menu-button'); await wait(`document.querySelector('.hm-menu').open`)
    check(`${device.id} menu opens`,await b.evaluate(`document.querySelector('.hm-menu-button').getAttribute('aria-expanded')`),'true')
    await b.page('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27})
    await b.page('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27})
    await wait(`!document.querySelector('.hm-menu').open`)
    check(`${device.id} Escape restores focus`,await b.evaluate(`document.activeElement===document.querySelector('.hm-menu-button')`))
  }
  await b.page('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})
  await navigate(`${site}/work?filter=Branding&source=qa#main-content`)
  check('Incoming filter query is applied',await b.evaluate(`document.querySelectorAll('[data-project-card]').length`),data.projects.filter(p=>p.tags.split(',').map(s=>s.trim()).includes('Branding')).length)
  await click('.hm-language');await wait(`location.pathname==='${site}/en/work'`)
  check('Language preserves current route, query and anchor',await b.evaluate(`location.pathname+location.search+location.hash`),`${site}/en/work?filter=Branding&source=qa#main-content`)
  await click('.hm-language');await wait(`location.pathname==='${site}/work'`)
  check('Language switches back',await b.evaluate(`document.querySelector('[data-template="hellomonday"]').lang`),'zh-CN')
  for(const [i,category] of ['all','Products','Experiences','Branding','Platform','E-commerce'].entries()) {
    await b.evaluate(`document.querySelectorAll('.hm-filters button')[${i}].click()`)
    const expected=category==='all'?data.projects.length:data.projects.filter(p=>p.tags.split(',').map(s=>s.trim()).includes(category)).length
    await wait(`document.querySelectorAll('[data-project-card]').length===${expected}`)
    check(`Filter ${category} returns correct count`,await b.evaluate(`document.querySelectorAll('[data-project-card]').length`),expected)
  }
  await b.evaluate(`document.querySelector('.hm-search input').focus()`)
  await b.page('Input.insertText',{text:'xyz-no-matching-project-123'})
  await wait(`!!document.querySelector('.hm-empty')`)
  check('Search has an explicit empty state',await b.evaluate(`document.querySelectorAll('[data-project-card]').length`),0)
  await click('.hm-empty button');await wait(`document.querySelectorAll('[data-project-card]').length===70`)
  for(const path of ['/contact','/careers','/internship']) {
    await navigate(site+path)
    check(`${path} empty form invalid`,await b.evaluate(`!document.querySelector('form').checkValidity()`))
    await b.evaluate(`{const f=document.querySelector('form');f.querySelector('[name=name]').value='模板测试';f.querySelector('[name=email]').value='preview@example.test';f.querySelector('[name=service]').value='products';if(f.querySelector('[name=portfolio]'))f.querySelector('[name=portfolio]').value='https://example.test/portfolio';f.querySelector('[name=message]').value='这是一份仅用于浏览器本地校验的测试内容。';f.querySelector('[name=consent]').checked=true;f.requestSubmit()}`)
    await wait(`document.querySelector('.hm-form-status').innerText.includes('尚未发送或保存')`)
    check(`${path} explicitly reports local validation only`,await b.evaluate(`document.querySelector('.hm-form-status').innerText.includes('尚未发送或保存')`))
  }
  check('Forms made no submission requests',b.events.filter(e=>e.method==='Network.requestWillBeSent'&&e.params.request.method==='POST'&&e.params.request.url.includes(site)).length,0)
  await click('.hm-faq summary');check('FAQ expands',await b.evaluate(`document.querySelector('.hm-faq details').open`))
  await navigate(`${site}/about`)
  const portrait=await b.evaluate(`document.querySelector('.hm-team img').src`)
  await click('.hm-team-switch');await wait(`document.querySelector('.hm-team img').src!==${JSON.stringify(portrait)}`)
  check('Team portrait changes on keyboard-accessible button',await b.evaluate(`document.querySelector('.hm-team img').src!==${JSON.stringify(portrait)}`))
  await navigate(`${site}/work/signs`)
  await click('.hm-case-gallery button');check('Case lightbox opens',await b.evaluate(`document.querySelector('.hm-lightbox').open`))
  const before=await b.evaluate(`document.querySelector('.hm-lightbox>img').src`)
  await b.page('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39})
  await wait(`document.querySelector('.hm-lightbox>img').src!==${JSON.stringify(before)}`)
  check('Case lightbox keyboard next image',await b.evaluate(`document.querySelector('.hm-lightbox>img').src!==${JSON.stringify(before)}`))
  await click('.hm-lightbox-close');check('Case lightbox closes',await b.evaluate(`!document.querySelector('.hm-lightbox').open`))
  await navigate(`${site}/product`)
  const quote=await b.evaluate(`document.querySelector('blockquote').innerText`)
  await b.evaluate(`document.querySelectorAll('.hm-quote-controls button')[1].click()`)
  await wait(`document.querySelector('blockquote').innerText!==${JSON.stringify(quote)}`)
  check('Product perspectives carousel changes',await b.evaluate(`document.querySelector('blockquote').innerText!==${JSON.stringify(quote)}`))
  await navigate(site)
  check('Reduced motion pauses hero video',await b.evaluate(`document.querySelector('.hm-hero video').paused`))
  await b.page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
  await wait(`!document.querySelector('.hm-hero video').paused`)
  check('Hero animation plays',await b.evaluate(`document.querySelector('.hm-hero video').videoWidth>0&&!document.querySelector('.hm-hero video').paused`))
  await click('.hm-hero .hm-media-toggle');await wait(`document.querySelector('.hm-hero video').paused`)
  check('Hero animation can be paused',await b.evaluate(`document.querySelector('.hm-hero video').paused`))
  await click('.hm-hero .hm-media-toggle');await wait(`!document.querySelector('.hm-hero video').paused`)
  await click('.hm-carousel-pause');check('Title carousel can be paused',await b.evaluate(`document.querySelector('.hm-carousel-pause').getAttribute('aria-pressed')`),'true')
  await b.page('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await b.evaluate(`window.__hmNavigationSentinel='same-document'`)
  await click('.hm-menu-button');await click('.hm-menu nav a')
  await wait(`location.pathname==='${site}/work'`)
  check('Internal navigation keeps the document',await b.evaluate(`window.__hmNavigationSentinel`),'same-document')
  for(const [device,width,height] of [['tablet',834,1180],['mobile',390,844]]) {
    await b.page('Page.navigate',{url:`${base}/templates/hellomonday/preview?viewport=${device}`})
    await wait(`!!document.querySelector('iframe')?.contentDocument?.querySelector('.hm-footer')`)
    await wait(`Object.keys(document.querySelector('iframe').contentDocument.querySelector('.hm-menu-button')||{}).some(k=>k.startsWith('__reactProps$'))`)
    check(`${device} preview has real CSS dimensions`,await b.evaluate(`{const w=document.querySelector('iframe').contentWindow;[w.innerWidth,w.innerHeight]}`),[width,height])
    await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.hm-menu-button').click()`)
    await wait(`document.querySelector('iframe').contentDocument.querySelector('.hm-menu').open`)
    check(`${device} iframe menu works`,await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.hm-menu').open`))
    await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.hm-close').click();document.querySelector('iframe').contentDocument.querySelector('.hm-language').click()`)
    await wait(`document.querySelector('iframe').contentWindow.location.pathname==='${site}/en'`)
    check(`${device} iframe language works`,await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('[data-template="hellomonday"]').lang`),'en')
  }
  await navigate('/templates/hellomonday')
  check('Detail preview opens a new tab',await b.evaluate(`document.querySelector('.market-secondary').target`),'_blank')
  const targetsBefore=new Set((await b.send('Target.getTargets')).targetInfos.map(t=>t.targetId))
  const point=await b.evaluate(`(()=>{const a=document.querySelector('.market-secondary');a.scrollIntoView({block:'center'});const r=a.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
  await b.page('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1})
  await b.page('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1})
  await delay(500)
  const newTargets=(await b.send('Target.getTargets')).targetInfos.filter(t=>!targetsBefore.has(t.targetId))
  check('Clicking preview really creates a new page',newTargets.some(t=>t.type==='page'&&t.url===`${base}${site}`))
  for(const target of newTargets)await b.send('Target.closeTarget',{targetId:target.targetId})
  check('Gallery lists three devices',await b.evaluate(`document.querySelectorAll('.market-device-option').length`),3)
  check('Gallery includes 12 actual screenshots',report.screenshots.length,12)
  // 逐一请求全部案例、文章与辅助页面，不能仅凭注册表就认定路由可用。
  const allPaths=['','/work','/services','/about','/stories','/product','/contact','/careers','/internship','/privacy','/terms',...data.projects.map(p=>`/work/${p.id}`),...data.articles.map(a=>`/stories/${a.id}`)]
  for(const locale of ['','/en']) {
    for(const path of allPaths) {
      const response=await fetch(`${base}${site}${locale}${path}`)
      const html=await response.text()
      assert.equal(response.status,200,`${locale}${path} status`)
      assert.ok(html.includes('hm-footer')&&!html.includes('NEXT_HTTP_ERROR_FALLBACK;404'),`${locale}${path} content`)
      report.routes.push({path:`${site}${locale}${path}`,status:response.status})
    }
    console.log('Verified routes',locale||'/zh',allPaths.length)
  }
  for(const path of ['/unknown','/work/unknown-case','/stories/unknown-story']) {
    const response=await fetch(`${base}${site}${path}`)
    check(`Unknown route ${path} returns 404`,response.status,404)
  }
  check('No uncaught browser exceptions',b.events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails),[])
  report.consoleErrors=b.events.filter(e=>e.method==='Runtime.consoleAPICalled'&&e.params.type==='error').map(e=>e.params.args.map(a=>a.value||a.description))
  check('No browser console errors',report.consoleErrors,[])
  await writeFile(new URL('verification-report.json',output),JSON.stringify(report,null,2))
  console.log(`Verified ${report.checks.length} checks, ${report.routes.length} routes, ${report.screenshots.length} screenshots`)
} finally {
  const exceptions=b.events.filter(e=>e.method==='Runtime.exceptionThrown').map(e=>e.params.exceptionDetails)
  if(exceptions.length)await writeFile(new URL('browser-exceptions.json',output),JSON.stringify(exceptions,null,2))
  await b.close()
}
