import { openBrowser, delay } from './lib/browser-cdp.mjs'
import { mkdir, writeFile } from 'node:fs/promises'
const out = new URL('../../artifacts/recueil-reference/', import.meta.url)
await mkdir(out, { recursive: true })
const b = await openBrowser()
try {
  await b.page('Page.navigate', { url: 'https://recueil.framer.website/' }); await delay(4000)
  const queue = ['/']; const seen = new Set(); const pages = []
  while (queue.length) {
    const path = queue.shift(); if (seen.has(path)) continue; seen.add(path)
    const data = await b.evaluate(`(async()=>{const path=${JSON.stringify(path)};const r=await fetch(path);const html=await r.text();const d=new DOMParser().parseFromString(html,'text/html');d.querySelectorAll('script,style,noscript').forEach(e=>e.remove());return {path,status:r.status,title:d.title,text:d.body.innerText||d.body.textContent,links:[...d.querySelectorAll('a[href]')].map(a=>({text:a.textContent,href:new URL(a.getAttribute('href'),location.origin+path).href})),images:[...d.images].map(i=>({src:i.getAttribute('src'),alt:i.alt,srcset:i.getAttribute('srcset')}))}})()`)
    pages.push(data)
    for (const link of data.links) { const u = new URL(link.href); if (u.origin === 'https://recueil.framer.website' && !seen.has(u.pathname)) queue.push(u.pathname) }
    console.log(data.path, data.status, data.links.map(l=>l.href).filter((v,i,a)=>a.indexOf(v)===i))
  }
  await writeFile(new URL('pages.json', out), JSON.stringify(pages, null, 2))
  for (const width of [1440,834,390]) {
    await b.page('Emulation.setDeviceMetricsOverride', {width,height:width===834?1180:width===390?844:1000,deviceScaleFactor:1,mobile:false})
    await b.page('Page.navigate',{url:'https://recueil.framer.website/'});await delay(4000)
    await b.evaluate('document.fonts.ready')
    await writeFile(new URL(`home-${width}.png`,out),Buffer.from((await b.page('Page.captureScreenshot',{format:'png'})).data,'base64'))
    if(width===1440){
      await writeFile(new URL('layout.json',out),JSON.stringify(await b.evaluate(`({height:document.body.scrollHeight,blocks:[...document.querySelectorAll('[id]')].map(e=>({id:e.id,y:Math.round(e.getBoundingClientRect().top+scrollY),height:Math.round(e.getBoundingClientRect().height)})),backgrounds:[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).backgroundImage.includes('url')).map(e=>({image:getComputedStyle(e).backgroundImage,y:Math.round(e.getBoundingClientRect().top+scrollY)}))})`),null,2))
      for(const y of [1000,2000,3000,4200,5400,6600,7800,9000,10200]){await b.evaluate(`scrollTo(0,${y})`);await delay(800);await writeFile(new URL(`section-${y}.png`,out),Buffer.from((await b.page('Page.captureScreenshot',{format:'png'})).data,'base64'))}
    }
  }
} finally { await b.close() }
