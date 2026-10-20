import { writeFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'
const output = new URL('../../artifacts/viral-comparison/', import.meta.url)
const browser = await openBrowser()
try {
  for (const [label,width,height] of [['desktop',1440,1000],['mobile',390,844],['tablet',834,1180]]) {
    await browser.page('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})
    await browser.page('Page.navigate',{url:'https://viral-sma.framer.website/'})
    await delay(7000)
    const data=await browser.evaluate(`(() => {const describe=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText?.slice(0,150),name:e.getAttribute('data-framer-name'),x:r.x,y:r.y,w:r.width,h:r.height,font:s.fontFamily,size:s.fontSize,line:s.lineHeight,spacing:s.letterSpacing,bg:s.backgroundColor,gap:s.gap,padding:s.padding}};return {headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.offsetWidth).map(e=>({self:describe(e),parent:describe(e.parentElement),grandparent:describe(e.parentElement.parentElement)})),resources:performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/woff|svg/.test(n)),svg:[...document.querySelectorAll('svg')].map(e=>e.outerHTML),images:[...document.images].map(e=>({src:e.src,alt:e.alt})),links:[...document.links].filter(e=>e.offsetWidth).map(e=>({text:e.innerText,href:e.href}))}})()`)
    await writeFile(new URL(`reference-${label}-detail.json`,output),JSON.stringify(data,null,2))
    for(const [name,y] of label==='desktop'?[['team',6300],['faq',7400],['footer',8500]]:[['hero',0],['services',1400]]) {
      await browser.evaluate(`scrollTo(0,${y})`);await delay(1500)
      const shot=await browser.page('Page.captureScreenshot',{format:'png'})
      await writeFile(new URL(`reference-${label}-${name}.png`,output),Buffer.from(shot.data,'base64'))
    }
    console.log(label)
  }
} finally {await browser.close()}
