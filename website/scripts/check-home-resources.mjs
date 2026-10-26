import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'

const origin = process.argv[2]
if (!origin) throw new Error('用法：node scripts/check-home-resources.mjs http://127.0.0.1:<端口>')
const response = await fetch(origin)
assert.equal(response.status, 200, '首页应返回 200')
const html = await response.text()
const styles = [...new Set([...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(match => match[1]))]
const scripts = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]))]
const resources = await Promise.all([...styles, ...scripts].map(async path => {
  const result = await fetch(new URL(path, origin))
  assert.equal(result.status, 200, path)
  const bytes = Buffer.from(await result.arrayBuffer())
  return { path, bytes: bytes.length, gzipBytes: gzipSync(bytes).length, source: bytes.toString('utf8') }
}))
const cssBytes = resources.filter(item => styles.includes(item.path)).reduce((sum, item) => sum + item.bytes, 0)
const jsGzipBytes = resources.filter(item => scripts.includes(item.path)).reduce((sum, item) => sum + item.gzipBytes, 0)
assert.ok(styles.length <= 3, `首页 CSS 请求过多：${styles.length}`)
assert.ok(cssBytes < 600_000, `首页 CSS 过大：${cssBytes}`)
assert.ok(jsGzipBytes < 400_000, `首页 JS 压缩体积过大：${jsGzipBytes}`)
assert.doesNotMatch(html, /style="opacity:0(?:;|")/, '首屏不得输出整页透明容器')
for (const item of resources) assert.doesNotMatch(item.source, /Unseen MiSans|\[playora:video\]|dm-menu-toggle/, `首页混入模板运行资源：${item.path}`)
console.log(JSON.stringify({ origin, status: response.status, styles: styles.length, scripts: scripts.length, cssBytes, jsGzipBytes, resources: resources.map(({ source, ...item }) => item) }, null, 2))
