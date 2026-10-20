import {openBrowser,delay} from './lib/browser-cdp.mjs';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const out=new URL('../../artifacts/noirei-reference/',import.meta.url);await mkdir(out,{recursive:true});
const b=await openBrowser();
try{
 await b.page('Page.navigate',{url:'https://noirei.framer.website/'});await delay(3500);
 const queue=['/'];const pages=[];const seen=new Set();
 while(queue.length){
  const batch=queue.splice(0,4).filter(path=>!seen.has(path));batch.forEach(path=>seen.add(path));
  const data=await b.evaluate(`Promise.all(${JSON.stringify(batch)}.map(async path=>{const r=await fetch(path);const html=await r.text();const d=new DOMParser().parseFromString(html,'text/html');d.querySelectorAll('script,style,noscript').forEach(e=>e.remove());return {path,status:r.status,title:d.title,headings:[...d.querySelectorAll('h1,h2,h3')].map(e=>e.textContent),text:d.body.textContent,blocks:[...d.querySelectorAll('h1,h2,h3,p,li,label')].map(e=>({tag:e.tagName,text:e.textContent})),links:[...d.querySelectorAll('a[href]')].map(a=>({text:a.textContent,href:new URL(a.getAttribute('href'),location.origin+path).href})),images:[...d.images].map(i=>({src:i.getAttribute('src'),alt:i.alt,srcset:i.getAttribute('srcset')}))}}))`);
  for(const p of data){pages.push(p);console.log(p.status,p.path,p.headings.join(' | '));for(const a of p.links){const u=new URL(a.href);if(u.origin==='https://noirei.framer.website'&&!seen.has(u.pathname)&&!queue.includes(u.pathname))queue.push(u.pathname);}}
 }
 await writeFile(new URL('pages.json',out),JSON.stringify(pages,null,2));
 for(const path of ['/about','/room','/experiences','/journal','/contact','/room/lake-classic-room','/experiences/the-stone-spa-ritual','/journal/the-silk-merchants-house','/offers/stay-longer','/legal']){
  await b.page('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await b.page('Page.navigate',{url:'https://noirei.framer.website'+path});await delay(2000);
  const name=path.slice(1).replaceAll('/','--');await writeFile(new URL(name+'.png',out),Buffer.from((await b.page('Page.captureScreenshot',{format:'png'})).data,'base64'));
 }
 for(const width of [834,390]){await b.page('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:1180,deviceScaleFactor:1,mobile:false});await b.page('Page.navigate',{url:'https://noirei.framer.website/'});await delay(2000);await writeFile(new URL('home-'+width+'.png',out),Buffer.from((await b.page('Page.captureScreenshot',{format:'png'})).data,'base64'));}
 console.log('REFERENCE_PAGES',pages.length);
}finally{await b.close()}
