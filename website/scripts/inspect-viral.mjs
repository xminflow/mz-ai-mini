import { writeFile, mkdir } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const output = new URL('../../artifacts/viral-comparison/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await openBrowser()
try {
  const targets = process.env.VIRAL_LOCAL_ONLY ? [['local', 'http://localhost:3000/templates/viral/site/en']] : [['reference', 'https://viral-sma.framer.website/'], ['local', 'http://localhost:3000/templates/viral/site/en']]
  for (const [name, url] of targets) {
    await browser.page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
    await browser.page('Page.navigate', { url })
    await delay(10000)
    await browser.evaluate('document.fonts.ready')
    const info = await browser.evaluate(`(() => {
      const visible = el => el.getBoundingClientRect().width > 0;
      const describe = el => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return { tag:el.tagName, text:el.innerText?.slice(0,180), x:r.x,y:r.y,width:r.width,height:r.height,font:s.fontFamily,size:s.fontSize,lineHeight:s.lineHeight,spacing:s.letterSpacing,weight:s.fontWeight,color:s.color,background:s.backgroundColor }; };
      return {url:location.href,title:document.title,body:describe(document.body), headings:[...document.querySelectorAll('h1,h2,h3')].filter(visible).map(describe),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),media:[...document.querySelectorAll('video,img')].filter(visible).map(el=>({src:el.currentSrc||el.src,...describe(el)}))};
    })()`)
    await writeFile(new URL(`${name}.json`, output), JSON.stringify(info,null,2))
    for (const [label, y] of [['hero',0],['services',1000],['lower',4200]]) {
      await browser.evaluate(`window.scrollTo(0,${y})`)
      await delay(1500)
      const shot = await browser.page('Page.captureScreenshot', {format:'png'})
      await writeFile(new URL(`${name}-${label}.png`,output),Buffer.from(shot.data,'base64'))
    }
    console.log(name,info.title,info.headings.length)
  }
} finally { await browser.close() }
