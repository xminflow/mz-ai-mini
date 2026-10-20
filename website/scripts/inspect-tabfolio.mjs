import { openBrowser, delay } from './lib/browser-cdp.mjs'
import { mkdir, writeFile } from 'node:fs/promises'

const output = new URL('../../artifacts/tabfolio-alignment/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await openBrowser()
try {
  for (const width of [1440, 834, 390]) {
    await browser.page('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
    for (const source of process.argv.includes('--local') ? ['local'] : ['reference', 'local']) {
      for (const route of ['', '/experiments', '/about', '/resume']) {
        const url = source === 'reference' ? `https://tabfoliopro.framer.ai${route}` : `http://127.0.0.1:3000/templates/tabfolio/site/en${route}`
        await browser.page('Page.navigate', { url })
        await delay(source === 'reference' ? 4500 : 2500)
        await browser.evaluate('document.fonts.ready')
        const name = `${source}${process.argv.includes('--local') ? '-after' : ''}-${width}-${route.slice(1) || 'home'}`
        const data = await browser.evaluate(`(() => {
          const elements = [...document.querySelectorAll('h1,h2,h3,p,nav,a,img,video')].filter(e=>e.getBoundingClientRect().width && e.getBoundingClientRect().top < 1700);
          return {url:location.href,title:document.title,overflow:document.documentElement.scrollWidth>innerWidth, elements:elements.map(e=>{ const r=e.getBoundingClientRect(), s=getComputedStyle(e); return {tag:e.tagName,text:e.innerText,src:e.currentSrc||e.src,href:e.getAttribute('href'),x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,color:s.color,background:s.background,borderRadius:s.borderRadius};})};
        })()`)
        await writeFile(new URL(`${name}.json`, output), JSON.stringify(data, null, 2))
        const shot = await browser.page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
        await writeFile(new URL(`${name}.png`, output), Buffer.from(shot.data, 'base64'))
        console.log(name, data.title, data.elements.length)
      }
    }
  }
} finally { await browser.close() }
