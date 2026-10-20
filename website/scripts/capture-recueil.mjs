import { mkdir, writeFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'
const origin = process.env.TEMPLATE_ORIGIN || 'http://localhost:3000'
const output = new URL('../public/templates/recueil/screenshots/', import.meta.url)
await mkdir(output, { recursive: true })
const b = await openBrowser()
try {
  await b.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const [device, width, height] of [['desktop',1440,1000],['tablet',834,1180],['mobile',390,844]]) {
    await b.page('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:false})
    await b.page('Page.navigate', {url:origin+'/templates/recueil/site'})
    let ready=false
    for(let i=0;i<180;i++){await delay(250);ready=await b.evaluate('!!document.querySelector(".rc-footer")&&document.readyState==="complete"');if(ready)break}
    if(!ready)throw Error('Page not ready: '+device)
    await b.evaluate('Promise.all([document.fonts.ready,...[...document.images].map(i=>{i.loading="eager";return i.decode().catch(()=>{})})])')
    for(const [name,id] of [['home','top'],['library','library'],['stories','stories'],['contact','contact']]){
      await b.evaluate(`scrollTo({top:${id==='top'?'0':`scrollY+document.getElementById('${id}').getBoundingClientRect().top-${width<640?75:105}`},behavior:'instant'})`)
      await delay(1700)
      await b.evaluate('document.querySelector("nextjs-portal")?.remove()')
      const check=await b.evaluate('({width:innerWidth,pageWidth:document.documentElement.clientWidth,gutter:getComputedStyle(document.documentElement).scrollbarGutter,overflow:document.documentElement.scrollWidth>innerWidth,badImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})')
      if(check.overflow||check.badImages.length||check.pageWidth!==width||check.gutter!=='auto')throw Error(JSON.stringify({device,name,...check}))
      await writeFile(new URL(`${device}-${name}.webp`,output),Buffer.from((await b.page('Page.captureScreenshot',{format:'webp',quality:90})).data,'base64'))
      console.log(JSON.stringify({device,name,width,height,...check}))
    }
  }
}finally{await b.close()}

