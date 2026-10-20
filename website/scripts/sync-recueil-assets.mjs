import { openBrowser, delay } from './lib/browser-cdp.mjs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
const run = promisify(execFile)
const out = new URL('../public/templates/recueil/assets/', import.meta.url)
await mkdir(out, { recursive: true })
const b = await openBrowser()
let media
try {
  await b.page('Page.navigate', { url: 'https://recueil.framer.website/' }); await delay(3000)
  media = await b.evaluate(`({videos:[...document.querySelectorAll('video')].map(e=>({src:e.currentSrc||e.src,poster:e.poster})),images:[...document.images].filter(i=>i.src.startsWith('https:')).map(i=>({src:i.src.split('?')[0],y:Math.round(i.getBoundingClientRect().top+scrollY)}))})`)
} finally { await b.close() }
await writeFile(new URL('../../artifacts/recueil-reference/media.json', import.meta.url), JSON.stringify(media,null,2))
const urls = [...new Set([...media.images.map(i=>i.src),...media.videos.flatMap(v=>[v.src,v.poster]).filter(Boolean)])]
const records=[]
await Promise.all(urls.map(async source=>{
  const name = new URL(source).pathname.split('/').pop(); const file = new URL(name,out)
  let bytes
  try { bytes=await readFile(file) } catch { const r=await fetch(source.includes('/images/')?source+'?scale-down-to=1600':source,{signal:AbortSignal.timeout(90000)});if(!r.ok)throw Error(`${r.status}: ${source}`);bytes=Buffer.from(await r.arrayBuffer());await writeFile(file,bytes) }
  records.push({source,file:`/templates/recueil/assets/${name}`,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')})
}))
// 使用环境已有 FFmpeg 派生适合网页的资源，保留原始下载与可核验的转换记录。
const originals = [...records]
for (const item of originals.filter(item => item.file.endsWith('.png'))) {
  const name = item.file.split('/').pop(), target = name.replace(/\.png$/, '.webp')
  await run('ffmpeg', ['-y','-v','error','-i',new URL(name,out).pathname.replace(/^\/([A-Z]:)/,'$1'),'-c:v','libwebp','-quality','82',new URL(target,out).pathname.replace(/^\/([A-Z]:)/,'$1')])
  const bytes = await readFile(new URL(target,out))
  records.push({source:item.source,derivedFrom:item.file,file:'/templates/recueil/assets/'+target,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),processing:'FFmpeg libwebp quality 82'})
}
const hero = originals.find(item=>item.file.endsWith('leJ6CwMmefzZwPCikM4IzreTd68.mp4'))
if(!hero)throw Error('Missing hero video')
const input = new URL(hero.file.split('/').pop(),out).pathname.replace(/^\/([A-Z]:)/,'$1')
const video = new URL('hero-loop.mp4',out)
await run('ffmpeg',['-y','-v','error','-i',input,'-vf','scale=1440:-2','-c:v','libx264','-crf','25','-preset','medium','-an','-movflags','+faststart',video.pathname.replace(/^\/([A-Z]:)/,'$1')])
const videoBytes = await readFile(video)
records.push({source:hero.source,derivedFrom:hero.file,file:'/templates/recueil/assets/hero-loop.mp4',bytes:videoBytes.length,sha256:createHash('sha256').update(videoBytes).digest('hex'),processing:'FFmpeg H.264 1440px CRF25, no audio, faststart'})
await writeFile(new URL('../public/templates/recueil/sources.json',import.meta.url),JSON.stringify({reference:'https://recueil.framer.website/',capturedAt:new Date().toISOString(),assets:records,fonts:{families:['Weelume MiSans 400/700','Weelume Poppins 400/600/700'],source:'/styles/brand-fonts.css'},license:'参考站公开展示未提供素材商业再分发许可。仅供内部参考演示，商用前需取得授权或替换。'},null,2))
console.log(JSON.stringify(media)); console.log('ASSETS',records.length)
