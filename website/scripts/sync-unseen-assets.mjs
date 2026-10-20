/** 拉取参考站公开展示素材并记录来源；保持内部预览，不授予任何第三方素材许可。 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const root = fileURLToPath(new URL('../', import.meta.url))
const output = resolve(root, 'public/templates/unseen')
const catalog = resolve(root, 'src/features/site-templates/catalog/unseen')
const source = 'https://unseen.co'
async function download(url, file) {
  await mkdir(dirname(file), { recursive: true })
  await run('curl.exe', ['--fail', '--location', '--silent', '--show-error', '--retry', '2', '--max-time', '75', url, '-o', file], { maxBuffer: 1024 * 1024 })
}
async function findOriginal(url) {
  if (!url.endsWith('.ktx2')) return url
  const stem = url.replace(/-\d+x\d+\.ktx2$/, '')
  for (const extension of ['jpg', 'png', 'jpeg', 'webp']) {
    const candidate = `${stem}.${extension}`
    const { stdout } = await run('curl.exe', ['--head', '--location', '--silent', '--max-time', '20', '--output', 'NUL', '--write-out', '%{http_code}', candidate])
    if (stdout === '200') { console.log(`Resolved original: ${url} → ${candidate}`); return candidate }
  }
  throw new Error(`No publicly available original image found for ${url}`)
}
async function mapLimit(items, work) {
  let cursor = 0
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (cursor < items.length) { const i = cursor++; await work(items[i], i) }
  }))
}
const referencePath = resolve(root, '../.local/unseen-pages')
await mkdir(referencePath, { recursive: true })
await download(`${source}/`, resolve(referencePath, 'index.html'))
await download(`${source}/world/`, resolve(referencePath, 'world.html'))
const html = await readFile(resolve(referencePath, 'index.html'), 'utf8')
const worldHtml = await readFile(resolve(referencePath, 'world.html'), 'utf8')
const extract = (html, name) => {
  const match = html.match(new RegExp(`${name} = ([\\s\\S]*?);?\\s*<\\/script>`))
  if (!match) throw new Error(`Missing reference data: ${name}`)
  return JSON.parse(match[1].trim().replace(/;$/, ''))
}
const projects = extract(html, 'projects')
const world = extract(worldHtml, 'worldData')
const manifest = []
await mapLimit(projects, async (item, i) => {
  const project = item.project
  const url = project.link
  const internal = url?.startsWith(`${source}/projects/`)
  const id = url?.startsWith(`${source}/`) ? new URL(url).pathname.split('/').filter(Boolean).at(-1) : project.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const images = item.images.filter(x => /\.(jpg|jpeg|png|webp)$/i.test(x.image))
  if (!images.length) {
    // KTX2 源图对应公开 JPEG 版本；下载失败直接终止，避免缺图被静默跳过。
    for (const image of item.images) images.push({ ...image, image: await findOriginal(image.image) })
  }
  const local = []
  await mapLimit(images, async (image, n) => {
    const extension = new URL(image.image).pathname.split('.').at(-1)
    const path = `/templates/unseen/photos/${String(i).padStart(2, '0')}-${n}.${extension}`
    await download(image.image, resolve(root, `public${path}`))
    local[n] = path
    manifest.push({ path, source: image.image, rights: '版权归原作者；未发现允许再分发或商用的公开授权，仅供内部复刻预览。' })
  })
  let overview = ''
  if (internal) {
    const file = resolve(referencePath, `${id}.html`)
    await download(url, file)
    const detail = await readFile(file, 'utf8')
    overview = detail.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    // 原站 HTML 用于本地核对；应用数据只保留项目结构，不向前端打包整页源代码。
    overview = overview.slice(overview.indexOf('Project Overview'), overview.indexOf('Our Approach'))
  }
  projects[i] = { id: id === 'blueyard' ? 'blueyard-digital' : id, name: project.title.trim(), categories: project.project_grid_category || [], description: project.description || '', source: url || `${source}/projects/`, images: local, overview }
  console.log(`Project ${i + 1}/${projects.length}: ${project.title}`)
})
await mapLimit(world, async (item, i) => {
  const url = await findOriginal(item.file)
  const extension = new URL(url).pathname.split('.').at(-1)
  const path = `/templates/unseen/world/${String(i).padStart(2, '0')}.${extension}`
  await download(url, resolve(root, `public${path}`))
  manifest.push({ path, source: url, rights: '版权归原作者；未发现允许再分发或商用的公开授权，仅供内部复刻预览。' })
  world[i] = { id: String(i).padStart(2, '0'), title: item.title.trim(), caption: item.caption, type: item.type, file: path, color: item.color }
  console.log(`World ${i + 1}/${world.length}`)
})
await mkdir(catalog, { recursive: true })
await writeFile(resolve(catalog, 'source-data.json'), JSON.stringify({ projects, world }, null, 2))
await writeFile(resolve(output, 'asset-sources.json'), JSON.stringify({ source, fetchedAt: new Date().toISOString(), rights: '未发现第三方素材公开商用许可。listed:false，仅供内部参考；对外交付前应替换素材或取得许可。字体复用项目本地 MiSans 与 Poppins。', assets: manifest }, null, 2))
console.log(`Saved ${manifest.length} assets.`)
