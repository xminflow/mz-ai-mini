/** 使用本机 Chrome 验证 Unseen 模板，生成三端截图与浏览器验收记录，无新增依赖。 */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const base = process.env.UNSEEN_PREVIEW_URL || 'http://localhost:3000'
const site = '/templates/unseen/site'
const output = resolve(root, 'public/templates/unseen/screenshots')
const source = JSON.parse(await readFile(resolve(root, 'src/features/site-templates/catalog/unseen/source-data.json'), 'utf8'))
await mkdir(output, { recursive: true })
const b = await openBrowser()
const report = { base, capturedAt: new Date().toISOString(), screenshots: [], checks: [], routes: [] }
const check = (name, actual, expected = true) => { assert.deepEqual(actual, expected, name); report.checks.push({ name, passed: true }); console.log(`PASS ${name}`) }
const navigate = async path => {
  const result = await b.page('Page.navigate', { url: `${base}${path}` })
  if (result.errorText) throw new Error(result.errorText)
  for (let i = 0; i < 160; i++) {
    if (await b.evaluate(`location.pathname === ${JSON.stringify(path.split('?')[0].split('#')[0])} && document.readyState==='complete' && !document.querySelector('nextjs-portal')?.shadowRoot?.querySelector('[data-nextjs-dialog-overlay]') && !!document.querySelector('.us-footer, .market-footer')`)) break
    if (i === 159) throw new Error(`Page not ready: ${path}`)
    await delay(100)
  }
  await b.evaluate(`document.querySelector('nextjs-portal')?.setAttribute('style','display:none'); document.documentElement.style.scrollBehavior='auto'; window.scrollTo({top:0,behavior:'instant'})`)
  await delay(250)
}
const waitFor = async expression => {
  for (let i = 0; i < 100; i++) { if (await b.evaluate(expression)) return; await delay(100) }
  throw new Error(`Condition timed out: ${expression}`)
}
const metrics = () => b.evaluate(`({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,heading:document.querySelector('h1')?.innerText,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))})`)
const click = selector => b.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`)
const pointerClick = async selector => {
  const { x, y } = await b.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
  await b.page('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 })
  await b.page('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 })
}
try {
  await b.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  const pages = [['home', ''], ['projects', '/projects'], ['world', '/world'], ['contact', '/contact']]
  for (const device of [{ prefix: '', width: 1440, height: 1000 }, { prefix: 'tablet-', width: 834, height: 1180 }, { prefix: 'mobile-', width: 390, height: 844 }]) {
    await b.page('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: 1, mobile: false })
    for (const [name, path] of pages) {
      await navigate(`${site}${path}`)
      const images = await b.evaluate(`(async()=>{await document.fonts.ready;[...document.images].forEach(i=>i.loading='eager');return (await Promise.all([...document.images].map(i=>i.decode().then(()=>null,()=>i.getAttribute('src'))))).filter(Boolean)})()`)
      check(`${device.prefix}${name}: local images`, images, [])
      await delay(500)
      const result = await metrics()
      check(`${device.prefix}${name}: no overflow`, !result.overflow)
      check(`${device.prefix}${name}: viewport`, [result.width, result.height], [device.width, device.height])
      const shot = await b.page('Page.captureScreenshot', { format: 'webp', quality: 87, captureBeyondViewport: false })
      const file = `${device.prefix}${name}.webp`
      await writeFile(resolve(output, file), Buffer.from(shot.data, 'base64'))
      report.screenshots.push({ file, path: `${site}${path}`, ...result })
      console.log(`Captured ${file}`)
    }
  }
  await b.page('Emulation.setDeviceMetricsOverride', { width: 320, height: 844, deviceScaleFactor: 1, mobile: false })
  for (const [, path] of pages) {
    await navigate(`${site}${path}`)
    check(`320px ${path || 'home'}: no overflow`, !(await metrics()).overflow)
    await click('.us-menu-button')
    check(`320px ${path || 'home'}: menu opens`, await b.evaluate(`document.querySelector('.us-menu').open`))
    await b.page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await b.page('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    await waitFor(`!document.querySelector('.us-menu').open`)
    check(`320px ${path || 'home'}: Escape closes menu`, await b.evaluate(`!document.querySelector('.us-menu').open`))
  }
  await b.page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await navigate(`${site}/projects?source=qa#main-content`)
  await click('.us-language')
  await waitFor(`location.pathname==='${site}/en/projects'`)
  check('Language switch preserves page, query and hash', await b.evaluate(`location.pathname+location.search+location.hash`), `${site}/en/projects?source=qa#main-content`)
  await click('.us-language'); await waitFor(`location.pathname==='${site}/projects'`)
  check('Language switches back to Chinese', await b.evaluate(`document.querySelector('[data-template="unseen"]').lang`), 'zh-CN')
  for (let i = 0; i < 5; i++) {
    await b.evaluate(`document.querySelectorAll('.us-filters button')[${i}].click()`)
    const expected = i === 0 ? source.projects.length : source.projects.filter(p => p.categories.includes(['all','branding','digital','motion','experiment'][i]) || (!p.categories.length && i===2)).length
    check(`Project filter ${i}: correct count`, await b.evaluate(`document.querySelectorAll('[data-project-card]').length`), expected)
  }
  await navigate(`${site}/contact`)
  await b.evaluate(`document.querySelectorAll('[role="tab"]')[1].click()`)
  check('Contact enquiry tabs', await b.evaluate(`document.querySelector('[role="tabpanel"]').innerText.includes('聊聊灵感')`))
  await click('.us-faq summary')
  check('FAQ expands', await b.evaluate(`document.querySelector('.us-faq details').open`))
  check('Empty enquiry is invalid', await b.evaluate(`!document.querySelector('form').checkValidity()`))
  await b.evaluate(`{const f=document.querySelector('form'); f.querySelector('[name=name]').value='模板体验'; f.querySelector('[name=email]').value='preview@example.test'; f.querySelector('[name=service]').value='0'; f.querySelector('[name=message]').value='这是一个仅用于本地校验的模板演示项目。'; f.querySelector('[name=consent]').checked=true; f.requestSubmit()}`)
  await delay(150)
  check('Form explicitly reports local validation only', await b.evaluate(`document.querySelector('.us-form-status').innerText.includes('尚未发送或保存')`))
  await navigate(`${site}/world`)
  const initial = await b.evaluate(`document.querySelector('.us-world-board').style.transform`)
  await b.evaluate(`document.querySelector('.us-world-viewport').focus()`)
  await b.page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 })
  await delay(100)
  check('World gallery keyboard pan', (await b.evaluate(`document.querySelector('.us-world-board').style.transform`)) !== initial)
  await b.evaluate(`document.querySelectorAll('.us-view-switch button')[1].click()`)
  await delay(150)
  check('All 58 World items reachable in accessible list', await b.evaluate(`document.querySelectorAll('.us-world-tile').length`), 58)
  await click('.us-world-tile')
  check('World media opens', await b.evaluate(`document.querySelector('.us-world-dialog').open`))
  await click('.us-dialog-close')
  check('World media closes', await b.evaluate(`!document.querySelector('.us-world-dialog').open`))
  await b.evaluate(`document.querySelectorAll('.us-world-tile')[3].click()`)
  await waitFor(`document.querySelector('.us-world-dialog video')?.readyState>=2`)
  await b.evaluate(`document.querySelector('.us-world-dialog video').play()`)
  await delay(400)
  check('Local World video plays', await b.evaluate(`document.querySelector('.us-world-dialog video').currentTime>0&&!document.querySelector('.us-world-dialog video').paused`))
  await click('.us-dialog-close')
  await b.evaluate(`document.querySelectorAll('.us-view-switch button')[0].click()`)
  await delay(150)
  const beforeZoom = await b.evaluate(`document.querySelector('.us-world-board').style.transform`)
  await b.evaluate(`document.querySelectorAll('.us-world-controls button')[2].click()`)
  await delay(150)
  check('World gallery zoom', (await b.evaluate(`document.querySelector('.us-world-board').style.transform`)) !== beforeZoom)
  const beforeDrag = await b.evaluate(`document.querySelector('.us-world-board').style.transform`)
  await b.page('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 720, y: 620 })
  await b.page('Input.dispatchMouseEvent', { type: 'mousePressed', x: 720, y: 620, button: 'left', clickCount: 1 })
  for (let i=1;i<=8;i++) { await b.page('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 720+i*18, y: 620+i*5, button: 'left', buttons: 1 }); await delay(20) }
  await b.page('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 864, y: 660, button: 'left', clickCount: 1 })
  await delay(200)
  check('World gallery pointer drag', (await b.evaluate(`document.querySelector('.us-world-board').style.transform`)) !== beforeDrag)
  await navigate(site)
  // 音频必须由真实用户手势启动，DOM click 不满足浏览器自动播放策略。
  await pointerClick('.us-sound button')
  await waitFor(`document.querySelector('.us-sound button').getAttribute('aria-pressed')==='true'`)
  check('Ambient sound starts only on request', await b.evaluate(`document.querySelector('.us-sound button').getAttribute('aria-pressed')`), 'true')
  await pointerClick('.us-sound button')
  await waitFor(`document.querySelector('.us-sound button').getAttribute('aria-pressed')==='false'`)
  check('Ambient sound can be muted', await b.evaluate(`document.querySelector('.us-sound button').getAttribute('aria-pressed')`), 'false')
  await b.evaluate(`window.__unseenStillFrame=document.querySelector('.us-scene canvas').toDataURL()`)
  await delay(180)
  check('Reduced motion keeps the scene still', await b.evaluate(`window.__unseenStillFrame===document.querySelector('.us-scene canvas').toDataURL()`))
  await b.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await delay(100)
  await b.evaluate(`window.__unseenMovingFrame=document.querySelector('.us-scene canvas').toDataURL()`)
  await delay(200)
  check('Water animates when motion is enabled', await b.evaluate(`window.__unseenMovingFrame!==document.querySelector('.us-scene canvas').toDataURL()`))
  await b.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await b.evaluate(`window.__unseenNavigationSentinel='same-document'`)
  await click('.us-hero-content .us-button')
  await waitFor(`location.pathname==='${site}/projects'`)
  check('Internal navigation keeps the document', await b.evaluate(`window.__unseenNavigationSentinel`), 'same-document')
  // 使用工作台真实入口检查设备 iframe，而非只检查 CSS 宽高声明。
  for (const [device,width,height] of [['tablet',834,1180],['mobile',390,844]]) {
    await b.page('Page.navigate', { url: `${base}/templates/unseen/preview?viewport=${device}` })
    await waitFor(`!!document.querySelector('iframe')?.contentDocument?.querySelector('.us-footer')`)
    // SSR 页脚先于 React 水合出现；待按钮绑定事件后再验证设备框内点击。
    await waitFor(`Object.keys(document.querySelector('iframe').contentDocument.querySelector('.us-menu-button')||{}).some(k=>k.startsWith('__reactProps$'))`)
    check(`${device} preview uses real CSS viewport`, await b.evaluate(`{const w=document.querySelector('iframe').contentWindow;[w.innerWidth,w.innerHeight]}`), [width,height])
    await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.us-menu-button').click()`)
    await waitFor(`document.querySelector('iframe').contentDocument.querySelector('.us-menu').open`)
    check(`${device} preview menu remains interactive`, await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.us-menu').open`))
    await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.us-menu-top button').click()`)
    await waitFor(`!document.querySelector('iframe').contentDocument.querySelector('.us-menu').open`)
    await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.us-language').click()`)
    await waitFor(`document.querySelector('iframe').contentWindow.location.pathname==='${site}/en'`)
    check(`${device} preview language switch`, await b.evaluate(`document.querySelector('iframe').contentDocument.querySelector('[data-template="unseen"]').lang`), 'en')
  }
  await navigate('/templates/unseen')
  check('Detail page direct preview opens a new tab', await b.evaluate(`document.querySelector('.market-secondary').target`), '_blank')
  check('Detail gallery registers three devices', await b.evaluate(`document.querySelectorAll('.market-device-option').length`), 3)
  await b.send('Target.setDiscoverTargets', { discover: true })
  const targetsBefore = (await b.send('Target.getTargets')).targetInfos.map(t=>t.targetId)
  await pointerClick('.market-secondary')
  await delay(600)
  const newTargets = (await b.send('Target.getTargets')).targetInfos.filter(t=>!targetsBefore.includes(t.targetId))
  check('Clicking direct preview creates a new page', newTargets.some(t=>t.type==='page'&&t.url===`${base}${site}`))
  for (const target of newTargets) await b.send('Target.closeTarget', {targetId:target.targetId})
  // 真正点击图标和品牌文字，分别验证落地路径；不只核对 href。
  for (const selector of ['.market-brand-mark', '.market-nav > a > span']) {
    await navigate('/templates')
    check('Marketplace displays all templates newest first', await b.evaluate(`[...document.querySelectorAll('.market-card')].map(a=>a.getAttribute('href'))`), ['unseen','deformo','conicorn','studiothink','nubo','grovia','lunera','liubai'].map(id=>`/templates/${id}`))
    check('Newest template is first in marketplace', await b.evaluate(`document.querySelector('.market-card')?.getAttribute('href') || document.querySelector('.market-container a[href^="/templates/unseen"]')?.getAttribute('href')`), '/templates/unseen')
    await click(selector)
    await waitFor(`location.pathname==='/'`)
    check(`Marketplace brand click returns home: ${selector}`, await b.evaluate(`location.pathname`), '/')
  }
  const paths = ['', '/projects', '/world', '/contact', '/privacy', '/terms', ...source.projects.map(p => `/projects/${p.id}`)]
  for (const locale of ['', '/en']) {
    for (const path of paths) {
      const response = await fetch(`${base}${site}${locale}${path}`)
      const html = await response.text()
      assert.equal(response.status, 200, `Route ${locale}${path}`)
      assert.ok(html.includes('us-footer'), `Missing template content ${locale}${path}`)
      assert.ok(!html.includes('NEXT_HTTP_ERROR_FALLBACK;404'), `RSC not found ${locale}${path}`)
      report.routes.push({ path: `${site}${locale}${path}`, status: response.status })
    }
    console.log(`Verified ${paths.length} ${locale || '/zh'} routes`)
  }
  check('Browser has no uncaught runtime exceptions', b.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.text), [])
  await writeFile(resolve(output, 'verification-report.json'), JSON.stringify(report, null, 2))
  console.log(`Verified ${report.checks.length} checks, ${report.routes.length} routes, ${report.screenshots.length} screenshots.`)
} finally { await b.close() }
