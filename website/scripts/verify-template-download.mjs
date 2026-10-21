import assert from 'node:assert/strict'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const origin = process.env.TEMPLATE_VERIFY_ORIGIN ?? 'http://localhost:3031'
const releases = JSON.parse(await readFile(new URL('../templates/releases.json', import.meta.url), 'utf8'))
const output = resolve('../artifacts/template-zip-release')
await mkdir(output, { recursive: true })
const browser = await openBrowser()
const results = []
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--ids' || !/^[a-z0-9-]+(?:,[a-z0-9-]+)*$/.test(args[1]))) throw new Error('用法: verify-template-download [--ids id1,id2]')
const ids = args.length ? args[1].split(',') : [...Object.keys(releases), 'liubai']
try {
  await browser.send('Browser.grantPermissions', { origin, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] })
  for (const id of ids) {
    await browser.page('Page.navigate', { url: origin + '/templates/' + id })
    let ready = false
    for (let i = 0; i < 120; i++) {
      ready = await browser.evaluate(`(() => { const summary = document.querySelector('#workbuddy-guide summary'); return !!summary && Object.keys(summary).some(key => key.startsWith('__reactProps$')); })()`)
      if (ready) break
      await delay(500)
    }
    assert.ok(ready, id + ': 详情页未加载')
    // 此验证隔离提示词交互；仅在浏览器测试上下文模拟已登录响应，不改变服务端鉴权。
    await browser.evaluate(`(() => { const actualFetch = window.fetch.bind(window); window.fetch = (input, init) => input === '/api/auth/me' ? Promise.resolve(new Response(JSON.stringify({ state: { authenticated: true } }), { status: 200, headers: { 'Content-Type': 'application/json' } })) : actualFetch(input, init); document.querySelector('#workbuddy-guide summary').click(); })()`)
    for (let i = 0; i < 40; i++) {
      if (await browser.evaluate(`!!document.querySelector('.market-workbuddy-prompt button')`)) break
      await delay(100)
    }
    const state = await browser.evaluate(`({ text: document.querySelector('.market-workbuddy-prompt pre')?.textContent ?? '', disabled: document.querySelector('.market-workbuddy-prompt button')?.disabled, hint: document.querySelector('.market-workbuddy-hint')?.textContent })`)
    assert.equal(typeof state.disabled, 'boolean', id + ': 教程未展开')
    if (releases[id]) {
      assert.equal(state.disabled, false)
      assert.ok(state.text.includes(releases[id].url))
      assert.ok(state.text.includes('下载并解压'))
      assert.ok(!state.text.includes('github.com'))
      await browser.page('Page.bringToFront')
      await browser.evaluate(`document.querySelector('.market-workbuddy-prompt button').click()`)
      await delay(200)
      assert.equal(await browser.evaluate('navigator.clipboard.readText()'), state.text)
    } else {
      assert.equal(state.disabled, true)
      assert.equal(state.text, '')
      assert.ok(state.hint.includes('尚未发布源码 ZIP'))
    }
    const screenshot = await browser.page('Page.captureScreenshot', { format: 'png' })
    await writeFile(resolve(output, id + '.png'), Buffer.from(screenshot.data, 'base64'))
    results.push({ id, status: 'passed', copied: !!releases[id], authentication: 'browser fixture' })
  }
  const exceptions = browser.events.filter(event => event.method === 'Runtime.exceptionThrown')
  assert.equal(exceptions.length, 0, '页面出现未捕获异常')
  await writeFile(resolve(output, 'browser-results.json'), JSON.stringify(results, null, 2) + '\n')
  console.log(JSON.stringify(results))
} finally {
  await browser.close()
}
