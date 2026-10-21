/** 按浏览器核对的全站素材清单同步影像并记录来源；只使用 Node 内置模块与系统 curl。 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const origin = 'https://deformo.framer.website'
const output = fileURLToPath(new URL('../public/templates/deformo/', import.meta.url))
const run = promisify(execFile)
// 当前环境的 Node fetch 访问源站会超时；显式使用系统 curl，失败立即终止。
const download = async url => (await run(process.platform === 'win32' ? 'curl.exe' : 'curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '45', url], { encoding: 'buffer', maxBuffer: 24 * 1024 * 1024, windowsHide: true })).stdout
const inspected = JSON.parse(await readFile(join(output, 'source-pages.json'), 'utf8'))
const urls = inspected.pages.map(page => page.url)
const images = new Map()
for (const page of inspected.pages) {
  for (const source of page.images) {
    images.set(source, [...new Set([...(images.get(source) || []), page.url])])
  }
}
await mkdir(join(output, 'photos'), { recursive: true })
const sources = []
for (const [source, pages] of images) {
  const bytes = await download(`${source}?scale-down-to=2048`)
  const isImage = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) || bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.subarray(0, 4).toString() === 'RIFF'
  if (!isImage) throw new Error(`${source}: response is not JPEG, PNG or WebP`)
  const file = `photos/${new URL(source).pathname.split('/').pop()}`
  await writeFile(join(output, file), bytes)
  sources.push({ file, source, pages, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), license: '参考站公开展示素材；未发现明确再分发或商业授权，上架前须确认授权或替换。' })
  console.log(`Downloaded ${file} (${bytes.length} bytes)`)
}
await writeFile(join(output, 'sources.json'), JSON.stringify({ reference: origin, inspectedAt: new Date().toISOString(), pages: urls, fonts: '复用项目本地 MiSans 400/700、Poppins 400/600/700，许可见 fonts/brand。', gradient: '本模板 CSS 渐变与 SVG 颗粒为自主实现，无外部 shader 依赖。', assets: sources }, null, 2))
