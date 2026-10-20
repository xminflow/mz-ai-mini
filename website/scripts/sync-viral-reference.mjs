import { writeFile, readFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'
const base = new URL('../public/templates/viral/',import.meta.url)
const browser=await openBrowser()
try {
  await browser.page('Page.navigate',{url:'https://viral-sma.framer.website/'})
  await delay(7000)
  const fonts=await browser.evaluate(`[...document.styleSheets].flatMap(s=>{try{return [...s.cssRules].filter(r=>r.type===5).map(r=>r.cssText)}catch{return []}}).filter(s=>/Inter|Source Serif|Havana/.test(s))`)
  const entries=[['assets/mark.png','https://framerusercontent.com/images/LFas6lcLm3H2glSteWdgbxz1dk.png'],['assets/avatar.png','https://framerusercontent.com/images/Rbw6rvapFkrGEhgPd2cq4ZKqX2M.png'],['assets/inter-semibold.woff2','https://framerusercontent.com/assets/1ZFS7N918ojhhd0nQWdj3jz4w.woff2']]
  for(const [family,file] of [['Inter','inter.woff2'],['Source Serif 4','source-serif.woff2'],['Havana','havana.woff']]) {
    const rule=fonts.find(s=>(s.includes(`font-family: "${family}"`)||s.includes(`font-family: ${family};`)) && (family === 'Havana' || s.includes('unicode-range: U+0-FF')) && (family !== 'Inter' || s.includes('font-style: normal')))
    const url=rule?.match(/url\("?([^"\)]+)"?\)/)?.[1]
    if(url) entries.push([`assets/${file}`,url])
  }
  const manifest=JSON.parse(await readFile(new URL('sources.json',base),'utf8'))
  for(const [local,url] of entries) {
    const bytes=await browser.evaluate(`(async()=>{const r=await fetch(${JSON.stringify(url)});if(!r.ok)throw new Error(r.status);const a=new Uint8Array(await r.arrayBuffer());let s='';for(const b of a)s+=String.fromCharCode(b);return btoa(s)})()`)
    await writeFile(new URL(local,base),Buffer.from(bytes,'base64'))
    const existing=manifest.assets.find(a=>a.local===local)
    if(existing) existing.source=url
    else manifest.assets.push({local,source:url})
    console.log('Saved',local)
  }
  const detail=JSON.parse(await readFile(new URL('../../artifacts/viral-comparison/reference-desktop-detail.json',import.meta.url),'utf8'))
  for(const [id,name] of [['svg8872744044','milano'],['svg12046384785','venice'],['svg11878651108','theo'],['svg11128975556','amsterdam']]) {
    const svg=detail.svg.find(s=>s.includes(`id="${id}"`)).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ')
    const local=`assets/logo-${name}.svg`
    await writeFile(new URL(local,base),svg)
    if(!manifest.assets.some(a=>a.local===local))manifest.assets.push({local,source:'https://viral-sma.framer.website/#'+id})
  }
  await writeFile(new URL('sources.json',base),JSON.stringify(manifest,null,2)+'\n')
} finally {await browser.close()}
