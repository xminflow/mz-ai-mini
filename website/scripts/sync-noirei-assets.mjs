import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),folder=new URL('public/templates/noirei/assets/',root);await mkdir(folder,{recursive:true});
const pages=JSON.parse(await readFile(new URL('../../artifacts/noirei-reference/pages.json',import.meta.url),'utf8'));
const sources=new Map(),media={};
for(const page of pages){media[page.path]=[...new Set(page.images.map(i=>i.src?.split('?')[0]).filter(url=>url?.startsWith('https://framerusercontent.com/images/')))];for(const url of media[page.path])sources.set(url,{source:url,alt:page.images.find(i=>i.src?.startsWith(url))?.alt});media[page.path]=media[page.path].map(url=>url.split('/').pop());}
const tasks=[...sources.values()],records=[];let next=0;
await Promise.all(Array.from({length:5},async()=>{while(next<tasks.length){const task=tasks[next++];const name=task.source.split('/').pop();const url=task.source+'?scale-down-to=1600';let bytes;try{bytes=await readFile(new URL(name,folder));}catch{const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`${r.status}: ${url}`);bytes=Buffer.from(await r.arrayBuffer());await writeFile(new URL(name,folder),bytes);}records.push({...task,file:'/templates/noirei/assets/'+name,download:url,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});console.log('ASSET',records.length+'/'+tasks.length,name);}}));
const catalog=new URL('src/features/site-templates/catalog/noirei/',root);await mkdir(catalog,{recursive:true});await writeFile(new URL('media.json',catalog),JSON.stringify(media,null,2));
await writeFile(new URL('public/templates/noirei/sources.json',root),JSON.stringify({reference:'https://noirei.framer.website/',capturedAt:new Date().toISOString(),pages:pages.map(p=>({path:p.path,title:p.title})),assets:records.sort((a,b)=>a.file.localeCompare(b.file)),fonts:{source:'/styles/brand-fonts.css',families:['Weelume MiSans 400/700','Weelume Poppins 400/600/700'],license:'沿用项目本地字体及许可记录'},license:'源站公开展示未提供素材商业再分发授权；仅作参考模板演示，交付或商用前确认授权或替换。'},null,2));
console.log('SYNC_OK',records.length);
