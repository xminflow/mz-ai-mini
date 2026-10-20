/** 采集公开参考页结构并本地化素材；不复制原站脚本、追踪器或表单。 */
import { readFile, writeFile, mkdir, readdir, rename, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { openBrowser } from './lib/browser-cdp.mjs'
const root = new URL('../', import.meta.url)
const out = new URL('public/templates/hellomonday/assets/', root)
const catalog = new URL('src/features/site-templates/catalog/hellomonday/', root)
await mkdir(out, {recursive:true}); await mkdir(catalog, {recursive:true})
const b = await openBrowser()
const sources = []
const run = promisify(execFile)
const extrasOnly=process.argv.includes('--extras')
async function parse(path) {
  const url = `https://www.hellomonday.com${path}`
  const response = await fetch(url, {signal:AbortSignal.timeout(45000)})
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  const html = await response.text()
  return b.evaluate(`(()=>{const d=new DOMParser().parseFromString(${JSON.stringify(html)},'text/html');const clean=s=>(s||'').replace(/\\s+/g,' ').trim(); const main=d.querySelector('main')||d.querySelector('#content')||d.body; return {path:${JSON.stringify(path)},title:clean(d.title),headings:[...main.querySelectorAll('h1,h2,h3')].map(e=>clean(e.textContent)).filter(Boolean),paragraphs:[...main.querySelectorAll('p')].map(e=>clean(e.textContent)).filter(s=>s.length>90),entries:[...d.querySelectorAll('.entry[data-slug]')].map(e=>({path:e.dataset.slug,title:clean(e.querySelector('.title')?.textContent),tags:e.dataset.tags||'',image:e.dataset.portraitImage||e.dataset.landscapeImage,landscape:e.dataset.landscapeImage,video:e.dataset.landscapeVideo||''})),links:[...d.querySelectorAll('a[href]')].map(a=>({path:a.getAttribute('href'),text:clean(a.textContent)})),images:[...main.querySelectorAll('img,[data-src],[data-landscape-image]')].map(i=>({src:i.dataset.landscapeImage||i.dataset.src||i.getAttribute('src'),alt:i.getAttribute('alt')||'',related:!!i.closest('.entry')})).filter(i=>i.src&&!i.src.startsWith('data:')),media:[...main.querySelectorAll('[data-src],video,source')].map(e=>e.dataset.src||e.getAttribute('src')).filter(Boolean)}})()`)
}
async function asset(src, label) {
  if(!src) return ''
  const url = new URL(src, 'https://www.hellomonday.com').href
  const ext = /\.(mp4|webm|gif|svg|png|jpe?g|webp)(?:\?|$)/i.exec(url)?.[1] || 'jpg'
  const isImage = /images.ctfassets/.test(url)
  const download = isImage ? (()=>{const u=new URL(url);u.searchParams.set('w','1200');u.searchParams.set('fm','webp');u.searchParams.set('q','82');return u.href})() : url
  const file = `${createHash('sha1').update(download).digest('hex').slice(0,14)}.${isImage?'webp':ext}`
  try {
    if((await stat(new URL(file,out))).size<12)throw new Error(`Invalid cached asset: ${file}`)
  } catch {
    console.log('Download', label, download)
    const partial=new URL(`${file}.part`,out)
    // 下载失败不能留下可被下次当作缓存命中的半个文件；成功后再原子替换目标。
    await run('curl.exe',['-f','-L','--connect-timeout','15','--max-time','60','--retry','2',download,'-o',fileURLToPath(partial)], {windowsHide:true})
    if((await stat(partial)).size<12)throw new Error(`Empty asset: ${download}`)
    await rename(partial,new URL(file,out))
  }
  sources.push({file,url:download,label,license:'原作者保留权利；未发现公开再分发许可，仅限内部参考，正式交付前须取得许可或替换。'})
  return `/templates/hellomonday/assets/${file}`
}
try {
  const work = await parse('/work')
  const stories = await parse('/stories')
  const about = await parse('/about')
  const service = await parse('/services')
  const storyLinks = [...new Map(stories.links.filter(l=>l.path?.startsWith('/stories/')).map(l=>[l.path,l])).values()]
  const entries = extrasOnly?[]:[...new Map(work.entries.map(p=>[p.path,p])).values()]
  console.log('Inventory', entries.length, 'projects;', storyLinks.length,'stories')
  const saved=extrasOnly?JSON.parse(await readFile(new URL('source-data.json',catalog),'utf8')):null
  if(extrasOnly)sources.push(...JSON.parse(await readFile(new URL('../sources.json',out),'utf8')).assets)
  const projects = saved?.projects||[]
  const collectProject = async (p,i) => {
    const detail = await parse(p.path)
    const images = [...new Set(detail.images.filter(x=>!x.related).map(x=>x.src).filter(s=>s.includes('images.ctfassets')))].slice(0,5)
    const local = []
    for(const image of images) local.push(await asset(image,p.title))
    projects[i]={...p,id:p.path.split('/').pop().replaceAll('&','-and-'),image:await asset(p.image,p.title),landscape:await asset(p.landscape,p.title),video:'',gallery:local,headings:detail.headings,paragraphs:detail.paragraphs}
    console.log(`Project ${i+1}/${entries.length} ${p.path}`)
  }
  for(let i=0;i<entries.length;i+=4) {
    await Promise.all(entries.slice(i,i+4).map((p,j)=>collectProject(p,i+j)))
  }
  const articles = saved?.articles||[]
  for(const link of extrasOnly?[]:storyLinks) {
    const detail = await parse(link.path)
    const images = [...new Set(detail.images.map(x=>x.src).filter(s=>s.includes('images.ctfassets')))].slice(0,4)
    const local=[]; for(const image of images) local.push(await asset(image,link.text))
    articles.push({id:link.path.split('/').pop(),title:detail.headings[0]||link.text,gallery:local,headings:detail.headings,paragraphs:detail.paragraphs})
    console.log('Story',link.path)
  }
  const extras={}
  for(const [name,page] of [['about',about],['services',service]]) {
    const local=[]
    for(const img of page.images.filter(x=>!x.src.includes('data:')).slice(0,35)) local.push(await asset(img.src,name))
    extras[name]=[...new Set(local)]
  }
  // 首屏视频由原站运行时注入，静态 HTML 不提供 src；这里记录已核对的公开素材地址。
  extras.hero=await asset('/assets/video/animations/hm-hero-desktop-non-retina.mp4','Homepage hand-drawn animation')
  extras.productHero=await asset('https://videos.ctfassets.net/9uhkiji6mhey/4OVP1nwGH2c9BT5xbGeDr0/b5dcaf7807d8d76081477a652dcf0cd3/Stabilized_2.mp4','Product collaboration video')
  const aboutHtml=await (await fetch('https://www.hellomonday.com/about')).text()
  const teamSource=await b.evaluate(`(()=>{const d=new DOMParser().parseFromString(${JSON.stringify(aboutHtml)},'text/html');return [...d.querySelectorAll('[data-thumbnail-mode="Mondayteer"]')].map(e=>({name:e.querySelector('.title').textContent.trim(),city:e.querySelector('.project').textContent.trim(),images:[e.dataset.landscapeImage,e.dataset.teenImage,e.dataset.babyImage].filter(Boolean)}))})()`)
  const team=[]
  for(const person of teamSource) {
    const images=[]
    for(const image of person.images)images.push(await asset(image,`Team: ${person.name}`))
    team.push({name:person.name,city:person.city,images})
  }
  // 对外交付数据只保留版式需要的结构，不把采集到的原文段落打入客户端包。
  const presentation=items=>items.map(({headings,paragraphs,video,...item})=>item)
  const result={reference:'https://www.hellomonday.com/',projects:presentation(projects),articles:presentation(articles),extras,team}
  await writeFile(new URL('source-data.json',catalog),JSON.stringify(result,null,2))
  const animations=[]
  for(const file of await readdir(out))if(file.endsWith('.webp')&&(await readFile(new URL(file,out))).subarray(0,128).includes(Buffer.from('ANIM')))animations.push(`/templates/hellomonday/assets/${file}`)
  await writeFile(new URL('animated-images.json',catalog),JSON.stringify(animations,null,2))
  await writeFile(new URL('../sources.json',out),JSON.stringify({reference:result.reference,assets:sources},null,2))
  console.log('Saved',projects.length,articles.length,sources.length)
} finally { await b.close() }
