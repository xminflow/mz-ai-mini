import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const base = process.env.HELLOMONDAY_PREVIEW_URL || 'http://localhost:3000'
const output = new URL('../../.local/hellomonday-hover/', import.meta.url)
await mkdir(output, { recursive: true })
const b = await openBrowser()
const checks = []
const check = (name, actual) => { assert.ok(actual, name); checks.push(name); console.log('PASS', name) }
const move = (x, y) => b.page('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
const state = () => b.evaluate(`(()=>{const e=document.querySelector('.hm-project-image');return {clip:getComputedStyle(e.querySelector('.hm-project-warp')).clipPath,filter:getComputedStyle(e.querySelector('.hm-project-warp')).filter,path:e.querySelector('path').getAttribute('d'),arrows:document.querySelectorAll('.hm-project-arrow').length}})()`)
const screenshot = async name => writeFile(new URL(`${name}.png`, output), Buffer.from((await b.page('Page.captureScreenshot', { format: 'png' })).data, 'base64'))
try {
  await b.page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await b.page('Page.navigate', { url: `${base}/templates/hellomonday/site/work` })
  for (let i = 0; i < 100; i++) {
    if (await b.evaluate(`!!document.querySelector('.hm-project-image')&&Object.keys(document.querySelector('.hm-project-image')).some(k=>k.startsWith('__reactProps$'))`)) break
    await delay(100)
  }
  await b.evaluate('document.fonts.ready')
  const r = await b.evaluate(`(()=>{const e=document.querySelector('.hm-project-image');e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()`)
  await delay(500)
  const paths = new Set()
  for (const [edge, x, y] of [
    ['left', r.x + r.w * .17, r.y + r.h * .6],
    ['right', r.x + r.w * .83, r.y + r.h * .6],
    ['top', r.x + r.w * .5, r.y + r.h * .17],
    ['bottom', r.x + r.w * .5, r.y + r.h * .83],
  ]) {
    await move(20, 20); await delay(1450)
    await move(x, y); await delay(180)
    const active = await state()
    check(`${edge} edge deforms using a smooth contour`, active.clip !== 'none' && active.path.includes('C'))
    check(`${edge} image texture remains unchanged and has no hover arrow`, active.filter === 'none' && active.arrows === 0)
    paths.add(active.path)
    await screenshot(edge)
    await move(r.x + r.w / 2, r.y + r.h / 2); await delay(1450)
    check(`${edge} releases in the center`, (await state()).clip === 'none')
  }
  check('Deformation follows the entry edge', paths.size === 4)
  await move(20, 20); await move(r.x + 15, r.y + r.h / 2); await delay(180)
  await move(20, 20); await delay(1450)
  check('Leaving restores a rectangular image', (await state()).clip === 'none')
  await move(r.x + 15, r.y + r.h / 2); await delay(180)
  await b.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await delay(250)
  check('Live reduced-motion change cancels the active contour', (await state()).clip === 'none')
  await move(r.x + 35, r.y + r.h / 2); await delay(250)
  check('Reduced motion prevents new deformation', (await state()).clip === 'none')
  await b.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await b.page('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await b.page('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r.x + 30, y: r.y + r.h / 2, radiusX: 1, radiusY: 1, force: 1, id: 1 }] })
  check('Touch does not deform the image', (await state()).clip === 'none')
  await b.page('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
  await b.page('Emulation.setTouchEmulationEnabled', { enabled: false })
  await move(20, 20); await move(r.x + 35, r.y + r.h / 2); await delay(180)
  const href = await b.evaluate(`document.querySelector('.hm-project-link').getAttribute('href')`)
  const point = { x: r.x + r.w / 2, y: r.y + r.h / 2, button: 'left', clickCount: 1 }
  await b.page('Input.dispatchMouseEvent', { type: 'mousePressed', ...point })
  await b.page('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point })
  for (let i = 0; i < 50; i++) { if (await b.evaluate(`location.pathname===${JSON.stringify(href)}`)) break; await delay(100) }
  check('Native image click still opens its case', await b.evaluate(`location.pathname===${JSON.stringify(href)}`))
  const errors = b.events.filter(e => e.method === 'Runtime.exceptionThrown' || e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
  check('No browser errors during interaction or unmount', errors.length === 0)
  await writeFile(new URL('report.json', output), JSON.stringify({ checkedAt: new Date().toISOString(), checks, errors }, null, 2))
} finally { await b.close() }
